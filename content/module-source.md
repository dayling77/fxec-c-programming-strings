# C Programming – Level 3 | Strings

Source: FXEC 5-Day Self-Learning Study Material, Reward Points Activity.
This file is the normalized source map used by the automated question generator. Questions must stay within these concepts and examples.

## Day 1 – Understanding Strings
- What a string is in C; strings are represented using character arrays.
- Null character '\\0' marks the end of a C string.
- Example: char name[] = "Jack"; is stored as J a c k \\0; five positions are required for four visible characters.
- Character array declaration such as char name[20]; and direct initialization.
- Printing strings with printf("%s", name).
- Reading strings with scanf() for a word and fgets() for a complete line.
- Character indexing and modifying individual characters.
- Day 1 challenge: read a student's full name and change the first character to X; example Jack Williams -> Xack Williams.

## Day 2 – String Library Functions
- #include <string.h>
- strlen(): returns visible string length; '\\0' is not included.
- strcpy(): copies source contents into destination.
- strcat(): appends the second string to the first; destination must have sufficient space.
- strcmp(): return value 0 means strings are equal.
- Exercises and coding practice use these four functions.

## Day 3 – Manual String Processing
- Implement string operations without string-library functions.
- Manual length: count until str[i] == '\\0'.
- Manual copy: copy characters and explicitly append '\\0'.
- Manual strcmp: compare corresponding characters and handle termination.
- Reverse a string with the two-pointer technique.
- Remove spaces.
- Convert lowercase characters to uppercase.
- Replace one character with another.
- Count vowels without string library functions.
- Knowledge check: a manually copied string must end with '\\0'; two-pointer technique is useful for reversing.
- Challenge example: hello world -> remove spaces, uppercase, reverse -> DLROWOLLEH.

## Day 4 – Character Frequency and String Analysis
- Character frequency; banana gives b=1, a=3, n=2.
- Frequency array: int frequency[256] = {0}; and increment frequency[(unsigned char)str[i]].
- Find the most frequent character from the frequency array.
- Find first repeating and first non-repeating characters.
- Count vowels and consonants.
- Count uppercase/lowercase letters, digits and special characters.
- Count words; source suggests detecting word beginnings rather than simply counting spaces.
- Find longest and shortest word.
- Example: first non-repeating character in swiss is w.
- Example: C programming is interesting contains 4 words.
- Complete String Analyzer challenge includes characters, words, vowels, consonants, digits, spaces, special characters, most frequent character and first non-repeating character.

## Day 5 – Advanced String Problem Solving
- Palindrome: reads the same in both directions; examples madam, level, radar, civic.
- Palindrome with two pointers using left/right indexes.
- Case-insensitive palindrome: normalize characters when the problem says case is ignored.
- Palindrome ignoring spaces; source example: A man a plan a canal Panama.
- Anagram: same characters with same frequencies; listen and silent are anagrams.
- Anagram using two frequency arrays.
- String rotation.
- Remove duplicate characters.
- First non-repeating character.
- Basic string compression; source example AAABBCCCC -> A3B2C4.
- Subsequence; source example ace is a subsequence of abcde.
- Longest word.
- Longest substring without repeating characters.
- Recommended solving order: understand -> write algorithm -> pseudocode -> C code -> test normal input -> test edge cases -> improve algorithm.
- Final Complete String Analyzer combines character count, word count, vowels, consonants, digits, spaces, special characters, most frequent character, first non-repeating character, reversed string, palindrome status and longest word. Advanced extension can ignore case, spaces and punctuation and handle multiple spaces.

## Mastery Checklist
Explain strings and '\\0'; declare and initialize character arrays; print with %s; read with scanf/fgets; index and modify characters; use strlen/strcpy/strcmp/strcat; implement operations manually; reverse with two pointers; frequency/repeating/non-repeating analysis; vowels/consonants; word count; longest word; palindrome; anagram; rotation; duplicate removal; compression; subsequence; systematic solution of advanced string problems.
