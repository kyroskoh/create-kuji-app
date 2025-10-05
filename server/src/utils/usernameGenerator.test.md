# Username Generator Test Examples

## How it works:
- Generates exactly **10 characters** from email prefix
- If collision occurs: **6 chars + _ + 4 random chars** (11 total)
- User sets permanent username: **5-20 characters**

## Test Cases:

### Case 1: Email with 10+ characters
**Input:** `john.doe@example.com`  
**Cleaned:** `johndoe` (7 chars)  
**Output:** `johndoe` + 3 random chars = `johndoeabc` (10 chars)

**Input:** `christopher@example.com`  
**Cleaned:** `christopher` (11 chars)  
**Output:** `christophe` (first 10 chars)

### Case 2: Email with 5-9 characters
**Input:** `alice@example.com`  
**Cleaned:** `alice` (5 chars)  
**Output:** `alice` + 5 random chars = `alice12345` (10 chars)

**Input:** `bob.smith@example.com`  
**Cleaned:** `bobsmith` (8 chars)  
**Output:** `bobsmith` + 2 random chars = `bobsmith12` (10 chars)

### Case 3: Email with less than 5 characters
**Input:** `jo@example.com`  
**Cleaned:** `jo` (2 chars)  
**Combined:** `userjo` (6 chars)  
**Output:** `userjo` + 4 random chars = `userjo1234` (10 chars)

**Input:** `a@example.com`  
**Cleaned:** `a` (1 char)  
**Combined:** `usera` (5 chars)  
**Output:** `usera` + 5 random chars = `usera12345` (10 chars)

### Case 4: Username collision
**Input:** `john.doe@example.com`  
**First attempt:** `johndoeabc` (10 chars) - **TAKEN**  
**Collision handling:** Take first 6 chars + underscore + 4 random  
**Output:** `johndo_a1b2` (11 chars)

### Case 5: Special characters in email
**Input:** `john.doe+test@example.com`  
**Cleaned:** `johndoetest` (11 chars, removes `.` and `+`)  
**Output:** `johndoetes` (first 10 chars)

## Validation Rules:

### Temporary Username (Generated):
- ✅ Exactly 10 characters (or 11 if collision)
- ✅ Lowercase alphanumeric only
- ✅ May contain underscore if collision

### Permanent Username (User-set):
- ✅ 5-20 characters
- ✅ Letters, numbers, hyphens, underscores
- ✅ Cannot be changed once set

## Examples of valid permanent usernames:
- `alice` (5 chars) ✅
- `john_doe` (8 chars) ✅
- `user-123` (8 chars) ✅
- `christopher_smith` (17 chars) ✅
- `a1b2c3d4e5f6g7h8i9j0` (20 chars) ✅

## Examples of invalid permanent usernames:
- `john` (4 chars) ❌ Too short
- `a1b2c3d4e5f6g7h8i9j0k` (21 chars) ❌ Too long
- `john doe` (contains space) ❌
- `john@doe` (contains @) ❌
- `user!123` (contains !) ❌
