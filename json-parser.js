class JSONParser {
    constructor(input) {
        this.input = input.trim();
        this.position = 0;
    }

    parse() {
        this.skipWhiteSpace();
        if (this.input[this.position] === "{") {
            return this.parseObject();
        }
        
        if (this.input[this.position] === "[") {
            return this.parseArray();
        }
        return this.parseValue();
    }

    parseObject() {
        let result = {};
        this.position++;
        this.skipWhiteSpace();
        if (this.input[this.position] === "}") {
            this.position++;
            return result;
        }
        
        while(this.position < this.input.length) {
            this.skipWhiteSpace();
            let key = this.parseString();
            this.skipWhiteSpace();
            if (this.input[this.position] !== ":") throw new Error("Expected ': after key");
            this.position++;
            this.skipWhiteSpace();
            let value = this.parseValue();
            result[key] = value;
            this.skipWhiteSpace();
            if (this.input[this.position] === "}") {
                this.position++;
                return result;
            }
            if (this.input[this.position] !== ",") throw new Error("Expected ',' between key-value pairs");
            this.position++;
        }
        throw new Error("Expected '}' at the end of the object");
    }

    parseString() {
        if (this.input[this.position] !== '"') throw new Error("Expected '\"' for string");
        let end = this.input.indexOf('"', this.position + 1);
        if (end === -1) throw new Error("Unterminated string");
        let str = this.input.slice(this.position + 1, end);
        this.position = end + 1;
        return str;

    }

    parseArray() {
        let result = [];
        this.position++;
        this.skipWhiteSpace();

        if (this.input[this.position] === "]") {
            this.position++;
            return result;
        }

        while(this.position < this.input.length) {
            let value = this.parseValue();
            result.push(value);
            this.skipWhiteSpace();

            if (this.input[this.position] === "]") {
                this.position++;
                return result;
            }

            if (this.input[this.position] !== ",") throw new Error("Expected ',' between array elements");
            this.position++;
            this.skipWhiteSpace();
        }

        throw new Error("Expected ']' at the end of the array");
    }

    parseValue() {
        //Boolean
        if (this.input.startsWith("true", this.position)) {
            this.position += 4;
            return true;
        }
        if (this.input.startsWith("false", this.position)) {
            this.position += 5;
            return false;
        }

        //Null
        if (this.input.startsWith("null", this.position) ) {
            this.position += 4;
            return null;
        }
        
        //String
        if (this.input[this.position] === '"') {
            return this.parseString();
        }

        //Numbers
        const numberRegex = /^-?\d+(\. \d+)?/;
        const numberMatch = numberRegex.exec(this.input.slice(this.position));
        if (numberMatch) {
            const number = Number(numberMatch[0]);
            this.position += numberMatch[0].length;
            return number;
        }

        //Arrays
        if (this.input[this.position] === "[") {
            return this.parseArray();
        }

        //Object
        if (this.input[this.position] === "{") {
            return this.parseObject();
        }
        throw new Error("Unexpected token in value position");
    }

    skipWhiteSpace() {
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }
    }
 }

// CLI Testing
// const fs = require("fs");
// const filePath = process.argv[2];

// if (!filePath) {
//     console.error("Usage: node json-parser.js <file>");
//     process.exit(1);
// }

// try {
//     const content = fs.readFileSync(filePath, "utf8");
//     const parser = new JSONParser(content);
//     const result = parser.parse();
//     console.log("Valid JSON:", JSON.stringify(result, null, 2));
//     process.exit(0);
// } catch (error) {
//     console.error("Invalid JSON:", error.message);
//     process.exit(1);
// }

// Custom Tests
function runTests() {
    const testCases = [
      { input: '{"key": "value"}', expected: { key: "value" } },
      { input: '{"key1": true, "key2": false, "key3": null}', expected: { key1: true, key2: false, key3: null } },
      { input: '{"key": [1, 2, 3]}', expected: { key: [1, 2, 3] } },
      { input: '{"key": {"nestedKey": "nestedValue"}}', expected: { key: { nestedKey: "nestedValue" } } },
      { input: '["value1", "value2"]', expected: ["value1", "value2"] },
      { input: '{"key": [true, false, null]}', expected: { key: [true, false, null] } },
      { input: '{"invalidKey":}', expectedError: true }, // Invalid case
      { input: '{"missingColon" "value"}', expectedError: true }, // Invalid case
      { input: '{invalid}', expectedError: true }, // Invalid case
      { input: '[1, 2,, 3]', expectedError: true }, // Invalid case
      { input: '{"key": [1, 2, {"nestedKey": "value"}]}', expected: { key: [1, 2, { nestedKey: "value" }] } },
    ];

    testCases.forEach(({ input, expected, expectedError }, index) => {
      try {
          const parser = new JSONParser(input);
          const result = parser.parse();
          console.assert(JSON.stringify(result) === JSON.stringify(expected), `Test case ${index + 1} failed. Expected ${JSON.stringify(expected)} but got ${JSON.stringify(result)}`);
          console.log(`Test case ${index + 1} passed.`);
      } catch (error) {
          if (expectedError) {
              console.log(`Test case ${index + 1} correctly failed with error: ${error.message}`);
          } else {
              console.error(`Test case ${index + 1} failed. Unexpected error thrown: ${error.message}`);
          }
      }
    });
}

runTests();