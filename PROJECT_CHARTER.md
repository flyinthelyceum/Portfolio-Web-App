# PROJECT_CHARTER.md
## Art & Technology — Student Portfolio System

---

## 1. Project Purpose (Canonical)

This repository is a **student-facing portfolio application** for the *Art & Technology* studio course.

Its purpose is to help students:

- document creative process consistently,
- publish finished and unfinished work,
- build a coherent narrative of experimentation across a semester,
- leave the course with a beautiful, shareable portfolio URL.

This project is **not** a personal portfolio for the instructor.

---

## 2. Primary Users

**Primary user:**  
High school students enrolled in Art & Technology.

**Secondary user:**  
Instructor, for critique, assessment, and longitudinal visibility into student thinking.

Students are assumed to have:

- little or no web development experience,
- uneven technical confidence,
- strong visual intuition.

The system must privilege **access, clarity, and aesthetic quality** over technical purity.

---

## 3. Core Conceptual Frame

This portfolio is not an archive.  
It is a **Working Portfolio**.

That means:

- process is visible,
- failure is documented,
- iteration is expected,
- incompleteness is allowed,
- organization is a form of thinking.

Documentation is treated as **studio practice**, not administrative overhead.

---

## 4. What This Project Is

- A single-instance multi-tenant web application
- A shared platform hosting all student portfolios
- A static frontend (HTML / CSS / JavaScript) with cloud database backend
- A living system used throughout the semester
- A habitat for logs, projects, images, and statements
- A bridge between studio work and public presentation
- An instructor dashboard for viewing all student work

---

## 5. What This Project Is NOT

- Not a personal portfolio for the instructor
- Not a one-off demo site
- Not a CMS that requires coding to use
- Not a framework-based application
- Not an engineering exercise

If a proposed change pushes the project toward any of the above, it is out of scope.

---

## 6. Non-Negotiable Constraints
 for student-facing interface
   - No bundlers
   - No frameworks requiring compilation
   - Backend services (Firebase, Supabase) via CDN are permitted
   - The project must run via static hosting

2. **Students must not edit code or deploy infrastructure**
   - Students only interact through the web interface
   - Personalization (name, bio, links) through web forms only
   - Content creation through intuitive UI (like Padlet)
   - No repository management, no hosting setup, no OAuth configuration

3. **Placeholders are intentional**
   - Sample names, bios, and content remain as examples
   - They demonstrate usage for students
   - They are not to be replaced with instructor information

4. **Documentation is the product**
   - Working Portfolio entries are central, not auxiliary
   - Posting must be fast, low-friction, and repeatable
   - Interface must feel like a content tool, not a technical system
   - Working Portfolio entries are central, not auxiliary
   - Posting must be fast, low-friction, and repeatable

---

## 7. Content Model (Canonical)

The system supports two primary content types.

### A. Working Portfolio (Logs)

- Short, frequent entries
- Images-first
- Dates visible
- Captures experiments, tests, failures, notes
- Think “studio notebook”, not “blog post”

### B. Projects

- Fewer, more developed entries
- Clear title and cover image
- Artist statement
- Final or provisional presentation
- Shown publicly and discussed in critique

This structure must remain stable because each category maps directly to **Canvas assignments**.

---

## 8. Aesthetic Direction

The portfolio itself is an **art object**.

Design priorities:

- editorial and brutalist sensibility
- strong typography
- asymmetry and collage
- intentional imperfection
- visible structure
- rich hover and interaction states

The UI should feel closer to a **studio publication** than a software dashboard.

---

## 9. Instructor all student portfolios from a single interface,
- see process over time for each student,
- reference entries during critique,
- evaluate completion without quantification,
- manage student accounts (add, archive, reset),
- export student work at semester's end
- quickly browse student work,
- see process over time,
- reference entries during critique,
- evaluate completion without quantification.

Assessment is **qualitative and pass/fail**.

---

##log in with their school email,
- change their displayed name and bio,
- add Working Portfolio entries with images (via + button),
- add Projects with statements,
- maintain their content throughout the semester,
- access a shareable public URL (e.g., `app.com/student/jsmith`) they are proud of.

An instructor can:

- view all student portfolios from one dashboard,
- monitor posting frequency and engagement,
- access individual portfolios for critique reference

- change their displayed name and bio,
- add Working Portfolio entries with images,
- add Projects with statements,
- maintain their site throughout the semester,
- publish a shareable URL they are proud of.

---

## 11. Authority

This document is **canonical**.

If any instruction, comment, or suggestion conflicts with this charter:

- the charter prevails,
- the conflicting instruction is discarded.
