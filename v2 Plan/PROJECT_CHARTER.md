# PROJECT_CHARTER.md
## Art & Technology — Student Portfolio System (Working Portfolio)

Last Updated: 2026-02-03

## 1. Purpose (Canonical)

This repository is a student-facing portfolio application for the Art & Technology studio course.

Its purpose is to help students:
- document creative process consistently
- publish finished and unfinished work
- build a coherent narrative of experimentation across a semester
- leave the course with a beautiful, shareable portfolio URL

This project is not a personal portfolio for the instructor.

## 2. Core Thesis

This is not an archive.
It is a Working Portfolio.

That means:
- process is visible
- failure is documented
- iteration is expected
- incompleteness is allowed
- organization is a form of thinking

Documentation is studio practice, not administrative overhead.

## 3. Users

Primary user:
- high school students enrolled in Art & Technology

Secondary user:
- instructor, for critique, assessment, and longitudinal visibility into student thinking

Assumptions:
- students have uneven technical confidence
- students have strong visual intuition
- the system must privilege access, clarity, and aesthetic quality over technical purity

## 4. What This Project Is

- a single shared web app hosting all student portfolios (multi-tenant)
- static frontend (HTML/CSS/JS) with a cloud backend (database + media storage)
- a living system used throughout the semester
- a habitat for logs, projects, images, and statements
- an instructor dashboard for viewing all student work
- a base dataset that can be curated into multiple public views over time

## 5. What This Project Is Not

- not an LMS submission replacement
- not a grading interface
- not a social feed
- not a résumé builder / branding tool
- not a CMS that requires students to code
- not an engineering exercise
- not a framework-based app that requires compilation or bundling

If a proposed change pushes the project toward any of the above, it is out of scope.

## 6. Non-Negotiable Constraints (Student-Facing)

1) No build step
- no bundlers
- no compilation-required frameworks
- small libraries via CDN are allowed if they do not introduce a build pipeline

2) Students do not touch code or deployments
- students only use the web interface
- personalization happens via forms (name, bio, links)
- content creation happens via a simple UI (Padlet-like)
- no repository management, no hosting setup, no OAuth configuration

3) Drafts are sacred
- user work is never silently lost
- destructive actions must be explicit
- recovery must exist (draft state, undo where feasible, clear confirmation patterns)

4) Documentation is the product
- creating a Log must be fast, repeatable, and low-friction
- the interface must feel like a studio tool, not a technical system

5) Privacy is school-safe by default
- default visibility is limited to the class + instructor
- public publishing is explicit and reversible

## 7. Canonical Content Model

Two primary content types (stable; maps directly to Canvas assignments):

A) Logs (Working Portfolio)
- short, frequent entries
- images-first
- date visible
- captures experiments, tests, failures, notes
- think: studio notebook, not blog post

Minimum required fields:
- createdAt
- media (one or more)
- phase tag (sketch / build / test / iteration / reflection)
- short note (1–3 sentences)

B) Projects
- fewer, more developed entries
- title + cover image
- artist statement
- final or provisional presentation
- shown publicly during critique (when instructor approves)

Minimum required fields:
- title
- cover media
- statement
- project tags (tools / materials / themes)
- createdAt

## 8. Roles and Authority (App Behavior)

Roles:
- Student: create/edit own content, manage own profile, control visibility of own posts
- Instructor/Admin: view all student work, feature/curate, manage accounts (add/archive/reset), export

Visibility states:
- Draft (private to student)
- Class (visible to class + instructor)
- Public (public URL)

Default:
- new Logs and Projects are Class-visible unless the user explicitly sets Draft

## 9. Aesthetic Direction

The portfolio itself is an art object.

Design priorities:
- editorial and brutalist sensibility
- strong typography
- asymmetry and collage
- intentional imperfection
- visible structure
- interaction states that feel deliberate, not app-store glossy

The UI should feel closer to a studio publication than a software dashboard.

## 10. Instructor Capabilities (Minimum)

An instructor can:
- view all student portfolios from a single interface
- browse Logs over time for critique reference
- quickly check participation without turning it into point-scoring
- manage student accounts (add, archive, reset)
- export student work at semester end (JSON/CSV, plus media references)

Assessment is qualitative and pass/fail. The app must not imply ranking.

## 11. Student Capabilities (Minimum)

A student can:
- log in with school email credentials
- edit displayed name, bio, and links
- add Logs with images via a + action
- add Projects with statements
- maintain content throughout the semester
- share a clean public URL when public publishing is enabled

## 12. Canonical Authority

This document is canonical.
If any instruction, comment, or suggestion conflicts with this charter:
- the charter prevails
- the conflicting instruction is discarded
