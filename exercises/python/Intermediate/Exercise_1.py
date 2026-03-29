# input a number
# Check if it's indeed a number
# if Not, throw error and exit
# Else run a loop from 1 to number
# multiply each instance of the loop to factorial variable that was initized as 1
# return the factorial

def factrl (num):
  if isinstance(num, int):
    factorial = 1
    for lp in range(1, `num + 1):
      factorial = factorial * lp
  else:
    print("Please pass integer number only")
  return factorial

print(factrl(5))
