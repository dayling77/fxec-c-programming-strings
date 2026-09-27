// FXEC Competitive C Coding Bank — original problems inspired by common competitive-programming domains.
// Not copied from HackerRank, CodeChef, TCS, or any other platform.
export const C_COMPETITIVE_CHALLENGES = [
  {
    "id": "CP-ALG-001",
    "title": "Balanced Digit Sum",
    "module": "C Fundamentals",
    "domain": "Implementation",
    "difficulty": "easy",
    "prompt": "Read an integer N and print YES if the sum of digits in odd positions from the right equals the sum of digits in even positions; otherwise print NO.",
    "xp": 25,
    "tests": [
      [
        "1234",
        "YES"
      ],
      [
        "12345",
        "NO"
      ],
      [
        "2468",
        "YES"
      ],
      [
        "1357",
        "NO"
      ],
      [
        "22",
        "YES"
      ],
      [
        "123456",
        "NO"
      ],
      [
        "8642",
        "YES"
      ],
      [
        "1212",
        "NO"
      ]
    ]
  },
  {
    "id": "CP-ALG-002",
    "title": "Power Without pow",
    "module": "C Fundamentals",
    "domain": "Recursion",
    "difficulty": "easy",
    "prompt": "Read integers a and b (b >= 0) and print a raised to power b using a user-defined function; do not use pow().",
    "xp": 25,
    "tests": [
      [
        "2 5",
        "32"
      ],
      [
        "7 0",
        "1"
      ],
      [
        "2 8",
        "256"
      ],
      [
        "10 3",
        "1000"
      ],
      [
        "4 4",
        "256"
      ],
      [
        "9 1",
        "9"
      ],
      [
        "1 7",
        "1"
      ],
      [
        "6 2",
        "36"
      ]
    ]
  },
  {
    "id": "CP-ALG-003",
    "title": "Prime Count",
    "module": "Control Flow",
    "domain": "Number Theory",
    "difficulty": "moderate",
    "prompt": "Read N and print the number of prime numbers from 2 through N.",
    "xp": 35,
    "tests": [
      [
        "10",
        "4"
      ],
      [
        "1",
        "0"
      ],
      [
        "2",
        "1"
      ],
      [
        "3",
        "2"
      ],
      [
        "50",
        "15"
      ],
      [
        "100",
        "25"
      ],
      [
        "0",
        "0"
      ],
      [
        "11",
        "5"
      ]
    ]
  },
  {
    "id": "CP-ALG-004",
    "title": "Collatz Length",
    "module": "Control Flow",
    "domain": "Number Theory",
    "difficulty": "moderate",
    "prompt": "Read a positive integer N and print the number of terms in its Collatz sequence, counting N and the final 1.",
    "xp": 35,
    "tests": [
      [
        "1",
        "1"
      ],
      [
        "6",
        "9"
      ],
      [
        "2",
        "2"
      ],
      [
        "3",
        "8"
      ],
      [
        "4",
        "3"
      ],
      [
        "5",
        "6"
      ],
      [
        "7",
        "17"
      ],
      [
        "10",
        "7"
      ]
    ]
  },
  {
    "id": "CP-ALG-005",
    "title": "Two Sum Indices",
    "module": "Arrays",
    "domain": "Searching",
    "difficulty": "moderate",
    "prompt": "Read N, an array and target. Print the zero-based indices of the first pair whose values add to target, choosing the smallest first index. Print -1 -1 if none exists.",
    "xp": 35,
    "tests": [
      [
        "5 2 7 11 15 3 9",
        "0 1"
      ],
      [
        "4 1 2 3 4 7",
        "2 3"
      ],
      [
        "4 2 4 5 7 9",
        "0 2"
      ],
      [
        "5 1 4 6 8 10 14",
        "1 3"
      ],
      [
        "4 5 5 1 2 10",
        "0 1"
      ],
      [
        "3 1 2 4 20",
        "-1 -1"
      ],
      [
        "6 3 8 12 4 7 9 16",
        "0 3"
      ],
      [
        "4 -2 5 7 9 7",
        "0 3"
      ]
    ]
  },
  {
    "id": "CP-ALG-006",
    "title": "Maximum Subarray Sum",
    "module": "Arrays",
    "domain": "Dynamic Programming",
    "difficulty": "moderate",
    "prompt": "Read N and an integer array. Print the maximum sum of any non-empty contiguous subarray.",
    "xp": 35,
    "tests": [
      [
        "5 -2 1 -3 4 5",
        "9"
      ],
      [
        "4 -5 -2 -8 -1",
        "-1"
      ],
      [
        "6 -2 1 -3 4 5 -1",
        "9"
      ],
      [
        "3 2 -1 2",
        "3"
      ],
      [
        "4 -1 -2 -3 -4",
        "-1"
      ],
      [
        "6 5 -10 6 7 -2 4",
        "15"
      ],
      [
        "1 8",
        "8"
      ],
      [
        "5 -1 2 3 4 -10",
        "9"
      ]
    ]
  },
  {
    "id": "CP-ALG-007",
    "title": "Fast Power",
    "module": "Functions & Modular Programming",
    "domain": "Divide and Conquer",
    "difficulty": "moderate",
    "prompt": "Read a and b and compute a^b using exponentiation by squaring in a function. Assume the result fits in signed 64-bit integer.",
    "xp": 35,
    "tests": [
      [
        "2 10",
        "1024"
      ],
      [
        "5 3",
        "125"
      ],
      [
        "3 5",
        "243"
      ],
      [
        "2 0",
        "1"
      ],
      [
        "7 2",
        "49"
      ],
      [
        "5 1",
        "5"
      ],
      [
        "10 5",
        "100000"
      ],
      [
        "2 16",
        "65536"
      ]
    ]
  },
  {
    "id": "CP-ALG-008",
    "title": "Recursive GCD",
    "module": "Functions & Modular Programming",
    "domain": "Recursion",
    "difficulty": "easy",
    "prompt": "Read two positive integers and return their greatest common divisor using a recursive function.",
    "xp": 25,
    "tests": [
      [
        "48 18",
        "6"
      ],
      [
        "100 25",
        "25"
      ],
      [
        "81 27",
        "27"
      ],
      [
        "54 24",
        "6"
      ],
      [
        "17 34",
        "17"
      ],
      [
        "99 66",
        "33"
      ],
      [
        "121 44",
        "11"
      ],
      [
        "13 13",
        "13"
      ]
    ]
  },
  {
    "id": "CP-ALG-009",
    "title": "Partition Around Pivot",
    "module": "Pointers",
    "domain": "Two Pointers",
    "difficulty": "moderate",
    "prompt": "Read N, an array and pivot P. Rearrange so values less than P come first, followed by values equal to P, then values greater than P. Sort each of the three groups in ascending order.",
    "xp": 35,
    "tests": [
      [
        "7 4 9 2 4 7 4 5 4",
        "2 4 4 4 4 9 7 5"
      ],
      [
        "5 3 1 2 3 4 5 3",
        "1 2 3 3 4 5"
      ],
      [
        "6 5 1 5 3 5 8 2 5",
        "1 3 2 5 5 5 5 8"
      ],
      [
        "5 2 2 2 1 3 2",
        "1 2 2 2 3"
      ],
      [
        "4 7 8 9 10 5",
        "5 7 8 9 10"
      ],
      [
        "5 1 4 2 6 3 3",
        "1 2 3 4 6"
      ],
      [
        "3 4 4 4 4",
        "4 4 4"
      ],
      [
        "6 9 1 8 2 7 3 5",
        "1 2 3 5 7 8 9"
      ]
    ]
  },
  {
    "id": "CP-ALG-010",
    "title": "Reverse In Place",
    "module": "Pointers",
    "domain": "Two Pointers",
    "difficulty": "easy",
    "prompt": "Read N and an array. Reverse it in place using two pointers and print the result.",
    "xp": 25,
    "tests": [
      [
        "5 1 2 3 4 5",
        "5 4 3 2 1"
      ],
      [
        "4 9 8 7 6",
        "6 7 8 9"
      ],
      [
        "1 99",
        "99"
      ],
      [
        "2 4 7",
        "7 4"
      ],
      [
        "6 1 2 3 4 5 6",
        "6 5 4 3 2 1"
      ],
      [
        "3 -1 0 5",
        "5 0 -1"
      ],
      [
        "5 0 0 1 1 2",
        "2 1 1 0 0"
      ],
      [
        "4 10 20 30 40",
        "40 30 20 10"
      ]
    ]
  },
  {
    "id": "CP-ALG-011",
    "title": "Rank Records",
    "module": "Structures, Unions & User-Defined Types",
    "domain": "Sorting",
    "difficulty": "moderate",
    "prompt": "Read N student records as register-number and total. Sort by total descending; break ties by register number ascending; print register numbers in order.",
    "xp": 35,
    "tests": [
      [
        "4 103 80 101 95 104 95 102 70",
        "101 104 103 102"
      ],
      [
        "3 9 50 2 50 5 40",
        "2 9 5"
      ],
      [
        "3 1 100 2 80 3 90",
        "1 3 2"
      ],
      [
        "4 10 50 4 50 2 75 1 20",
        "2 4 10 1"
      ],
      [
        "2 8 10 3 10",
        "3 8"
      ],
      [
        "5 5 70 4 60 3 70 2 80 1 60",
        "2 3 5 1 4"
      ],
      [
        "1 99 50",
        "99"
      ]
    ]
  },
  {
    "id": "CP-ALG-012",
    "title": "Frequency Record",
    "module": "Structures, Unions & User-Defined Types",
    "domain": "Frequency Counting",
    "difficulty": "moderate",
    "prompt": "Read N integer values and store each distinct value with its frequency in records. Print the value with highest frequency; break ties by smaller value.",
    "xp": 35,
    "tests": [
      [
        "7 4 2 4 1 2 4 3",
        "4"
      ],
      [
        "5 3 3 2 2 1",
        "2"
      ],
      [
        "8 5 5 5 2 2 3 3 3",
        "3"
      ],
      [
        "6 -1 -1 0 0 0 2",
        "0"
      ],
      [
        "4 9 8 7 6",
        "6"
      ],
      [
        "7 10 10 9 9 9 8 8",
        "9"
      ],
      [
        "3 4 4 5",
        "4"
      ]
    ]
  },
  {
    "id": "CP-ALG-013",
    "title": "Dynamic Unique List",
    "module": "Dynamic Memory & Memory Management",
    "domain": "Arrays",
    "difficulty": "moderate",
    "prompt": "Read N integers, dynamically allocate storage, remove duplicate values while preserving first occurrence, and print the resulting list.",
    "xp": 35,
    "tests": [
      [
        "7 4 2 4 1 2 4 3",
        "4 2 1 3"
      ],
      [
        "5 1 1 1 1 1",
        "1"
      ],
      [
        "6 1 2 1 3 2 4",
        "1 2 3 4"
      ],
      [
        "4 9 8 9 8",
        "9 8"
      ],
      [
        "3 -1 -1 -2",
        "-1 -2"
      ],
      [
        "5 5 4 3 2 1",
        "5 4 3 2 1"
      ],
      [
        "2 7 7",
        "7"
      ]
    ]
  },
  {
    "id": "CP-ALG-014",
    "title": "Dynamic Growth",
    "module": "Dynamic Memory & Memory Management",
    "domain": "Implementation",
    "difficulty": "moderate",
    "prompt": "Read N integers using a dynamically growing array that starts with capacity 2. Print the final values in input order.",
    "xp": 35,
    "tests": [
      [
        "5 10 20 30 40 50",
        "10 20 30 40 50"
      ],
      [
        "3 7 8 9",
        "7 8 9"
      ],
      [
        "6 1 2 3 4 5 6",
        "1 2 3 4 5 6"
      ],
      [
        "2 8 9",
        "8 9"
      ],
      [
        "4 0 -1 2 3",
        "0 -1 2 3"
      ],
      [
        "7 5 4 3 2 1 0 -1",
        "5 4 3 2 1 0 -1"
      ],
      [
        "3 100 200 300",
        "100 200 300"
      ],
      [
        "5 -5 -4 -3 -2 -1",
        "-5 -4 -3 -2 -1"
      ]
    ]
  },
  {
    "id": "CP-ALG-015",
    "title": "File Frequency Report",
    "module": "File Handling",
    "domain": "Files",
    "difficulty": "moderate",
    "prompt": "Read N integers, write them to data.txt, reopen the file, and print the value with the highest frequency; break ties by smaller value.",
    "xp": 35,
    "tests": [
      [
        "7 4 2 4 1 2 4 3",
        "4"
      ],
      [
        "5 3 3 2 2 1",
        "2"
      ],
      [
        "6 1 2 2 3 3 3",
        "3"
      ],
      [
        "4 7 7 8 8",
        "7"
      ],
      [
        "5 -1 -1 0 0 2",
        "-1"
      ],
      [
        "3 5 6 7",
        "5"
      ],
      [
        "8 1 1 2 2 2 3 3 4",
        "2"
      ]
    ]
  },
  {
    "id": "CP-ALG-016",
    "title": "File Sorted Report",
    "module": "File Handling",
    "domain": "Files + Sorting",
    "difficulty": "moderate",
    "prompt": "Read N integers, write them to data.txt, reopen the file, sort the values in ascending order, and print them.",
    "xp": 35,
    "tests": [
      [
        "5 4 1 3 2 5",
        "1 2 3 4 5"
      ],
      [
        "3 9 7 8",
        "7 8 9"
      ],
      [
        "4 8 3 5 1",
        "1 3 5 8"
      ],
      [
        "6 9 0 2 7 4 3",
        "0 2 3 4 7 9"
      ],
      [
        "2 -1 -5",
        "-5 -1"
      ],
      [
        "5 5 4 3 2 1",
        "1 2 3 4 5"
      ],
      [
        "3 100 10 50",
        "10 50 100"
      ]
    ]
  },
  {
    "id": "CP-ALG-017",
    "title": "Anagram Check",
    "module": "Strings",
    "domain": "Strings + Frequency",
    "difficulty": "moderate",
    "prompt": "Read two lowercase words and print YES if they are anagrams, otherwise NO.",
    "xp": 35,
    "tests": [
      [
        "listen silent",
        "YES"
      ],
      [
        "hello world",
        "NO"
      ],
      [
        "abc bca",
        "YES"
      ],
      [
        "rat car",
        "NO"
      ],
      [
        "anagram nagaram",
        "YES"
      ],
      [
        "a aa",
        "NO"
      ],
      [
        "listen enlist",
        "YES"
      ],
      [
        "abc abd",
        "NO"
      ]
    ]
  },
  {
    "id": "CP-ALG-018",
    "title": "Longest Unique Substring",
    "module": "Strings",
    "domain": "Sliding Window",
    "difficulty": "tough",
    "prompt": "Read a string without spaces and print the length of the longest substring containing no repeated character.",
    "xp": 50,
    "tests": [
      [
        "abcabcbb",
        "3"
      ],
      [
        "bbbbb",
        "1"
      ],
      [
        "abcdef",
        "6"
      ],
      [
        "abba",
        "2"
      ],
      [
        "dvdf",
        "3"
      ],
      [
        "anviaj",
        "5"
      ],
      [
        "tmmzuxt",
        "5"
      ],
      [
        "aab",
        "2"
      ]
    ]
  },
  {
    "id": "CP-ALG-019",
    "title": "Count Set Bits",
    "module": "Advanced C",
    "domain": "Bit Manipulation",
    "difficulty": "easy",
    "prompt": "Read a non-negative integer and print the number of set bits in its binary representation.",
    "xp": 25,
    "tests": [
      [
        "10",
        "2"
      ],
      [
        "7",
        "3"
      ],
      [
        "1",
        "1"
      ],
      [
        "2",
        "1"
      ],
      [
        "3",
        "2"
      ],
      [
        "15",
        "4"
      ],
      [
        "16",
        "1"
      ],
      [
        "31",
        "5"
      ]
    ]
  },
  {
    "id": "CP-ALG-020",
    "title": "Minimum Coins",
    "module": "Advanced C",
    "domain": "Greedy",
    "difficulty": "moderate",
    "prompt": "Using coin denominations 25, 10, 5 and 1, read an amount and print the minimum number of coins needed.",
    "xp": 35,
    "tests": [
      [
        "41",
        "4"
      ],
      [
        "63",
        "5"
      ],
      [
        "1",
        "1"
      ],
      [
        "5",
        "1"
      ],
      [
        "10",
        "1"
      ],
      [
        "11",
        "2"
      ],
      [
        "24",
        "6"
      ],
      [
        "26",
        "2"
      ]
    ]
  }
];
export const C_COMPETITIVE_BY_ID = Object.freeze(Object.fromEntries(C_COMPETITIVE_CHALLENGES.map(x=>[x.id,x])));
