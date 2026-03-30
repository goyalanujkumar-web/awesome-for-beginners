const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const specs = require('./exercise-specs');

class ExerciseValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.relativePath = this.getRelativePath(filePath);
    this.spec = specs[this.relativePath];
    this.content = fs.readFileSync(filePath, 'utf8');
    this.errors = [];
  }

  getRelativePath(filePath) {
    const match = filePath.match(/exercises\/.+/);
    return match ? match[0] : filePath;
  }

  validate() {
    if (!this.spec) {
      throw new Error(`No specification found for ${this.relativePath}`);
    }

    // Run all tests
    for (const test of this.spec.tests) {
      this.runTest(test);
    }

    // Compile if needed
    if (this.spec.needsCompile) {
      this.compile();
    }

    // Run if needed
    if (this.spec.needsRun) {
      this.run();
    }

    return this.errors.length === 0;
  }

  runTest(test) {
    try {
      let passed = false;

      if (test.regex) {
        passed = test.regex.test(this.content);
      } else if (test.fn) {
        passed = test.fn(this.content);
      }

      if (!passed) {
        this.errors.push(test.error);
      }
    } catch (error) {
      this.errors.push(`${test.check}: ${error.message}`);
    }
  }

  compile() {
    try {
      const outputFile = `/tmp/${path.basename(this.filePath, path.extname(this.filePath))}_test`;
      
      if (this.filePath.endsWith('.java')) {
        execSync(`javac "${this.filePath}"`, { encoding: 'utf-8', stdio: 'pipe' });
      } else if (this.filePath.endsWith('.cpp')) {
        execSync(`g++ "${this.filePath}" -o "${outputFile}"`, { encoding: 'utf-8', stdio: 'pipe' });
      }
    } catch (error) {
      this.errors.push(`Compilation failed: ${error.message}`);
    }
  }

  run() {
    try {
      const outputFile = `/tmp/${path.basename(this.filePath, path.extname(this.filePath))}_test`;
      let output = '';

      if (this.filePath.endsWith('.java')) {
        const className = path.basename(this.filePath, '.java');
        const dir = path.dirname(this.filePath);
        output = execSync(`java -cp ${dir} ${className}`, { 
          encoding: 'utf-8',
          timeout: 5000,
          stdio: 'pipe'
        }).trim();
      } else if (this.filePath.endsWith('.cpp')) {
        output = execSync(`"${outputFile}"`, { 
          encoding: 'utf-8',
          timeout: 5000,
          stdio: 'pipe'
        }).trim();
      }

      if (this.spec.expectedOutput) {
        if (!output.includes(this.spec.expectedOutput)) {
          this.errors.push(`Expected output to contain "${this.spec.expectedOutput}" but got "${output}"`);
        }
      }

      // Cleanup
      try {
        fs.unlinkSync(outputFile);
      } catch (e) {}
    } catch (error) {
      this.errors.push(`Execution failed: ${error.message}`);
    }
  }

  getErrors() {
    return this.errors;
  }
}

module.exports = ExerciseValidator;
