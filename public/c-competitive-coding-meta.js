// UI metadata for the HackerRank-style competitive coding layer.
export const C_COMPETITIVE_META = [
  {
    "id": "CP-ALG-001",
    "challengeId": "CP-ALG-001",
    "module": "C Fundamentals",
    "domain": "Implementation",
    "prompt": "Read an integer N and print YES if the sum of digits in odd positions from the right equals the sum of digits in even positions; otherwise print NO.",
    "sampleTests": [
      [
        "1234",
        "YES"
      ],
      [
        "12345",
        "NO"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-002",
    "challengeId": "CP-ALG-002",
    "module": "C Fundamentals",
    "domain": "Recursion",
    "prompt": "Read integers a and b (b >= 0) and print a raised to power b using a user-defined function; do not use pow().",
    "sampleTests": [
      [
        "2 5",
        "32"
      ],
      [
        "7 0",
        "1"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-003",
    "challengeId": "CP-ALG-003",
    "module": "Control Flow",
    "domain": "Number Theory",
    "prompt": "Read N and print the number of prime numbers from 2 through N.",
    "sampleTests": [
      [
        "10",
        "4"
      ],
      [
        "1",
        "0"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-004",
    "challengeId": "CP-ALG-004",
    "module": "Control Flow",
    "domain": "Number Theory",
    "prompt": "Read a positive integer N and print the number of terms in its Collatz sequence, counting N and the final 1.",
    "sampleTests": [
      [
        "1",
        "1"
      ],
      [
        "6",
        "9"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-005",
    "challengeId": "CP-ALG-005",
    "module": "Arrays",
    "domain": "Searching",
    "prompt": "Read N, an array and target. Print the zero-based indices of the first pair whose values add to target, choosing the smallest first index. Print -1 -1 if none exists.",
    "sampleTests": [
      [
        "5 2 7 11 15 3 9",
        "0 1"
      ],
      [
        "4 1 2 3 4 7",
        "2 3"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-006",
    "challengeId": "CP-ALG-006",
    "module": "Arrays",
    "domain": "Dynamic Programming",
    "prompt": "Read N and an integer array. Print the maximum sum of any non-empty contiguous subarray.",
    "sampleTests": [
      [
        "5 -2 1 -3 4 5",
        "9"
      ],
      [
        "4 -5 -2 -8 -1",
        "-1"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-007",
    "challengeId": "CP-ALG-007",
    "module": "Functions & Modular Programming",
    "domain": "Divide and Conquer",
    "prompt": "Read a and b and compute a^b using exponentiation by squaring in a function. Assume the result fits in signed 64-bit integer.",
    "sampleTests": [
      [
        "2 10",
        "1024"
      ],
      [
        "5 3",
        "125"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-008",
    "challengeId": "CP-ALG-008",
    "module": "Functions & Modular Programming",
    "domain": "Recursion",
    "prompt": "Read two positive integers and return their greatest common divisor using a recursive function.",
    "sampleTests": [
      [
        "48 18",
        "6"
      ],
      [
        "100 25",
        "25"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-009",
    "challengeId": "CP-ALG-009",
    "module": "Pointers",
    "domain": "Two Pointers",
    "prompt": "Read N, an array and pivot P. Rearrange so values less than P come first, followed by values equal to P, then values greater than P. Sort each of the three groups in ascending order.",
    "sampleTests": [
      [
        "7 4 9 2 4 7 4 5 4",
        "2 4 4 4 4 9 7 5"
      ],
      [
        "5 3 1 2 3 4 5 3",
        "1 2 3 3 4 5"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-010",
    "challengeId": "CP-ALG-010",
    "module": "Pointers",
    "domain": "Two Pointers",
    "prompt": "Read N and an array. Reverse it in place using two pointers and print the result.",
    "sampleTests": [
      [
        "5 1 2 3 4 5",
        "5 4 3 2 1"
      ],
      [
        "4 9 8 7 6",
        "6 7 8 9"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-011",
    "challengeId": "CP-ALG-011",
    "module": "Structures, Unions & User-Defined Types",
    "domain": "Sorting",
    "prompt": "Read N student records as register-number and total. Sort by total descending; break ties by register number ascending; print register numbers in order.",
    "sampleTests": [
      [
        "4 103 80 101 95 104 95 102 70",
        "101 104 103 102"
      ],
      [
        "3 9 50 2 50 5 40",
        "2 9 5"
      ]
    ],
    "hiddenTestCount": 5,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-012",
    "challengeId": "CP-ALG-012",
    "module": "Structures, Unions & User-Defined Types",
    "domain": "Frequency Counting",
    "prompt": "Read N integer values and store each distinct value with its frequency in records. Print the value with highest frequency; break ties by smaller value.",
    "sampleTests": [
      [
        "7 4 2 4 1 2 4 3",
        "4"
      ],
      [
        "5 3 3 2 2 1",
        "2"
      ]
    ],
    "hiddenTestCount": 5,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-013",
    "challengeId": "CP-ALG-013",
    "module": "Dynamic Memory & Memory Management",
    "domain": "Arrays",
    "prompt": "Read N integers, dynamically allocate storage, remove duplicate values while preserving first occurrence, and print the resulting list.",
    "sampleTests": [
      [
        "7 4 2 4 1 2 4 3",
        "4 2 1 3"
      ],
      [
        "5 1 1 1 1 1",
        "1"
      ]
    ],
    "hiddenTestCount": 5,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-014",
    "challengeId": "CP-ALG-014",
    "module": "Dynamic Memory & Memory Management",
    "domain": "Implementation",
    "prompt": "Read N integers using a dynamically growing array that starts with capacity 2. Print the final values in input order.",
    "sampleTests": [
      [
        "5 10 20 30 40 50",
        "10 20 30 40 50"
      ],
      [
        "3 7 8 9",
        "7 8 9"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-015",
    "challengeId": "CP-ALG-015",
    "module": "File Handling",
    "domain": "Files",
    "prompt": "Read N integers, write them to data.txt, reopen the file, and print the value with the highest frequency; break ties by smaller value.",
    "sampleTests": [
      [
        "7 4 2 4 1 2 4 3",
        "4"
      ],
      [
        "5 3 3 2 2 1",
        "2"
      ]
    ],
    "hiddenTestCount": 5,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-016",
    "challengeId": "CP-ALG-016",
    "module": "File Handling",
    "domain": "Files + Sorting",
    "prompt": "Read N integers, write them to data.txt, reopen the file, sort the values in ascending order, and print them.",
    "sampleTests": [
      [
        "5 4 1 3 2 5",
        "1 2 3 4 5"
      ],
      [
        "3 9 7 8",
        "7 8 9"
      ]
    ],
    "hiddenTestCount": 5,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-017",
    "challengeId": "CP-ALG-017",
    "module": "Strings",
    "domain": "Strings + Frequency",
    "prompt": "Read two lowercase words and print YES if they are anagrams, otherwise NO.",
    "sampleTests": [
      [
        "listen silent",
        "YES"
      ],
      [
        "hello world",
        "NO"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-018",
    "challengeId": "CP-ALG-018",
    "module": "Strings",
    "domain": "Sliding Window",
    "prompt": "Read a string without spaces and print the length of the longest substring containing no repeated character.",
    "sampleTests": [
      [
        "abcabcbb",
        "3"
      ],
      [
        "bbbbb",
        "1"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-019",
    "challengeId": "CP-ALG-019",
    "module": "Advanced C",
    "domain": "Bit Manipulation",
    "prompt": "Read a non-negative integer and print the number of set bits in its binary representation.",
    "sampleTests": [
      [
        "10",
        "2"
      ],
      [
        "7",
        "3"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  },
  {
    "id": "CP-ALG-020",
    "challengeId": "CP-ALG-020",
    "module": "Advanced C",
    "domain": "Greedy",
    "prompt": "Using coin denominations 25, 10, 5 and 1, read an amount and print the minimum number of coins needed.",
    "sampleTests": [
      [
        "41",
        "4"
      ],
      [
        "63",
        "5"
      ]
    ],
    "hiddenTestCount": 6,
    "starter": "#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}"
  }
];
export const C_COMPETITIVE_META_BY_ID = Object.freeze(Object.fromEntries(C_COMPETITIVE_META.map(x=>[x.id,x])));
