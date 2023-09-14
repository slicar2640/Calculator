const readline = require("readline");

const equation = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

equation.question("Expression to evaluate: ", function (answer) { console.log(evaluate(answer)) });

function evaluate(s) {
  let tokens = tokenize(s)
  let parsed = parse(tokens)
  let result = evaluatePostfix(parsed)
  return result
}

function tokenize(s) {
  let tokens = [];
  for (let i = 0; i < s.length; i++) {
    let char = s[i]

    if (isNumber(char)) {
      let j = i
      while (j < s.length && isNumber(s[j])) {
        j++;
      }

      tokens.push({
        type: "number",
        lexeme: s.substring(i, j)
      });

      i = j - 1
    } else if (isOperator(char)) {
      tokens.push({
        type: "operator",
        lexeme: char
      });
    }
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].type == "number") {
      if (tokens[i + 1].lexeme == "(") {
        tokens.splice(i + 1, 0, {
          type: "operator",
          lexeme: "*"
        });
      }
    }
  }

  return tokens;
}

function parse(tokens) {
  let outputQueue = [];
  let operatorStack = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '^': 3,
  };

  for (let token of tokens) {
    if (token.type == "number") {
      outputQueue.push(token);
    } else if (token.type == "operator") {
      if (token.lexeme === '(') {
        operatorStack.push(token);
      } else if (token.lexeme === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].lexeme !== '(') {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.pop();
      } else {
        while (operatorStack.length > 0 && precedence[operatorStack[operatorStack.length - 1].lexeme] >= precedence[token.lexeme]) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    }
  }
  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  return outputQueue;
}

function evaluatePostfix(postfix) {
  let stack = [];
  for (let token of postfix) {
    if (token.type == "number") {
      stack.push(parseFloat(token.lexeme));
    } else if (token.type == "operator") {
      let operand2 = stack.pop();
      let operand1 = stack.pop();

      let result;
      switch (token.lexeme) {
        case '+': result = operand1 + operand2; break;
        case '-': result = operand1 - operand2; break;
        case '*': result = operand1 * operand2; break;
        case '/': result = operand1 / operand2; break;
        case '%': result = operand1 % operand2; break;
        case '^': result = Math.pow(operand1, operand2); break;
      }

      stack.push(result)
    }
  }
  return stack[0]
}

function isNumber(char) {
  return /[0-9.]/.test(char)
}

function isOperator(char) {
  return /[+\-*/%^()]/.test(char);
}
