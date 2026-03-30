const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Track all test results
const results = {
  passed: [],
  failed: []
};

// ============= HTML TESTS =============
function testHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `HTML: ${filename}`;
  
  try {
    // Basic structure
    if (!/<html[^>]*>[\s\S]*<\/html>/i.test(content)) {
      throw new Error('Missing <html> tags');
    }
    if (!/<head[^>]*>[\s\S]*<\/head>/i.test(content)) {
      throw new Error('Missing <head> tags');
    }
    if (!/<body[^>]*>[\s\S]*<\/body>/i.test(content)) {
      throw new Error('Missing <body> tags');
    }
    if (!/<title[^>]*>[\s\S]*<\/title>/i.test(content)) {
      throw new Error('Missing <title> tag');
    }
    if (!/<!DOCTYPE\s+html\s*>/i.test(content)) {
      throw new Error('Missing or incorrect DOCTYPE');
    }
    
    // Check for unclosed tags (simple heuristic)
    const openTags = (content.match(/<(\w+)[^>]*>/g) || []).length;
    const closeTags = (content.match(/<\/(\w+)>/g) || []).length;
    if (openTags !== closeTags) {
      throw new Error('Mismatched opening and closing tags');
    }
    
    // Exercise-specific checks
    if (filename.includes('Exercise_1')) {
      if (!/<h1[^>]*>/i.test(content)) {
        throw new Error('Missing <h1> tag for heading');
      }
      if (!/<p[^>]*>/i.test(content)) {
        throw new Error('Missing <p> tag for paragraph');
      }
    }
    
    if (filename.includes('Exercise_2')) {
      if (!/<img[^>]*src=/i.test(content)) {
        throw new Error('Missing or broken <img> tag');
      }
      if (!/<a[^>]*href=/i.test(content)) {
        throw new Error('Missing or broken <a> (link) tag');
      }
      if (/<a[^>]*href\s*=\s*"www\./i.test(content)) {
        throw new Error('Link must have http:// or https:// protocol');
      }
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= CSS TESTS =============
function testCSS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `CSS: ${filename}`;
  
  try {
    // Basic syntax
    if (!/\{[\s\S]*\}/g.test(content)) {
      throw new Error('No CSS rules found (missing braces)');
    }
    
    const braceMatch = content.match(/{/g) || [];
    const closeMatch = content.match(/}/g) || [];
    if (braceMatch.length !== closeMatch.length) {
      throw new Error('Mismatched curly braces');
    }
    
    // Exercise-specific checks
    if (filename.includes('Exercise_1')) {
      if (!content.includes('color:')) {
        throw new Error('Missing "color:" property (note: NOT "colour:")');
      }
      if (content.includes('colour:')) {
        throw new Error('Found "colour:" - should be "color:" (American spelling)');
      }
    }
    
    if (filename.includes('Exercise_2')) {
      if (!content.includes('.title')) {
        throw new Error('Missing .title class selector');
      }
      if (!content.includes('#title')) {
        throw new Error('Missing #title ID selector');
      }
    }
    
    if (filename.includes('Exercise_1') && filename.includes('Intermediate')) {
      if (!content.includes('display: flex')) {
        throw new Error('Missing "display: flex" - check flexbox exercise');
      }
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= JAVASCRIPT TESTS =============
function testJavaScript(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `JavaScript: ${filename}`;
  
  try {
    // Syntax check
    try {
      new Function(content);
    } catch (e) {
      throw new Error(`Syntax error: ${e.message}`);
    }
    
    // Exercise-specific checks
    if (filename.includes('Exercise_1') && filename.includes('Beginner')) {
      if (content.includes('consol')) {
        throw new Error('Typo found: "consol" should be "console"');
      }
      if (!content.includes('console.log')) {
        throw new Error('Must use console.log() to print');
      }
    }
    
    if (filename.includes('Exercise_2') && filename.includes('Beginner')) {
      // Calculator should use arithmetic, not string concatenation
      if (content.match(/const\s+sum\s*=\s*a\s*\+\s*b/)) {
        // Check if a and b are strings
        if (content.includes('prompt') && !content.includes('parseInt') && !content.includes('Number(')) {
          throw new Error('Calculator: Convert inputs to numbers using parseInt() or Number()');
        }
      }
    }
    
    if (filename.includes('Exercise_1') && filename.includes('Intermediate')) {
      if (!content.includes('function factorial')) {
        throw new Error('Missing factorial function');
      }
      if (!/if\s*\(\s*n\s*===\s*0\s*\)/.test(content)) {
        throw new Error('Factorial must handle base case: n === 0');
      }
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= PYTHON TESTS =============
function testPython(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `Python: ${filename}`;
  
  try {
    // Syntax check
    try {
      execSync(`python3 -m py_compile "${filePath}"`, { encoding: 'utf-8' });
    } catch (e) {
      throw new Error(`Syntax error: ${e.message}`);
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= JAVA TESTS =============
function testJava(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `Java: ${filename}`;
  
  try {
    // Check for TODO
    if (content.includes('TODO')) {
      throw new Error('File contains TODO - exercise is incomplete');
    }
    
    // Compilation test
    try {
      execSync(`javac "${filePath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) {
      throw new Error(`Compilation error: ${e.toString()}`);
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= C++ TESTS =============
function testCpp(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const testName = `C++: ${filename}`;
  
  try {
    // Check for TODO
    if (content.includes('TODO')) {
      throw new Error('File contains TODO - exercise is incomplete');
    }
    
    // Compilation test
    try {
      execSync(`g++ -c "${filePath}" -o /tmp/test.o`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) {
      throw new Error(`Compilation error: ${e.toString()}`);
    }
    
    results.passed.push(testName);
    return true;
  } catch (error) {
    results.failed.push(`${testName}: ${error.message}`);
    return false;
  }
}

// ============= MAIN =============
function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }
  
  if (filePath.endsWith('.html')) {
    return testHTML(filePath);
  } else if (filePath.endsWith('.css')) {
    return testCSS(filePath);
  } else if (filePath.endsWith('.js')) {
    return testJavaScript(filePath);
  } else if (filePath.endsWith('.py')) {
    return testPython(filePath);
  } else if (filePath.endsWith('.java')) {
    return testJava(filePath);
  } else if (filePath.endsWith('.cpp')) {
    return testCpp(filePath);
  }
  
  return true;
}

// Export for use in workflow
module.exports = { validateFile, results };

// If run directly
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node test-all.js <filepath>');
    process.exit(1);
  }
  
  const passed = validateFile(filePath);
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`Passed: ${results.passed.length}`);
  results.passed.forEach(p => console.log(`  ✅ ${p}`));
  
  if (results.failed.length > 0) {
    console.log(`Failed: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`  ❌ ${f}`));
  }
  
  process.exit(passed ? 0 : 1);
}
