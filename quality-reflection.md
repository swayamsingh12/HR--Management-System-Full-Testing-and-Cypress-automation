# Quality Reflection

**Written by:** Swayam Singh
**Date:** 12-06-2026

---

## Q1 — Do you write tests in your own projects?

Honestly, not consistently. When I started my internship
at Kraftshala I did not write automated tests at all.
I was focused on getting features working and testing
manually by clicking through the UI.

That changed when I started building the Cypress
automation suite at Kraftshala. I began writing
automated tests for the first time — not because
someone told me to but because I kept finding the
same bugs coming back after fixes. Manual testing
every time was getting exhausting.

Now I write tests for flows I have broken before.
Not for everything — I am honest about that. But
for anything involving data that goes to users,
I write at least one automated check.

My actual workflow right now:
- Manual exploratory testing first to understand
  the feature
- Automated Cypress tests for flows I know will
  be touched again
- API tests in Postman for endpoints that have
  business logic

I do not have a perfect testing habit. But I have
a growing one.

---

## Q2 — A time I shipped something not fully tested

During my internship at Kraftshala I was working
on automating the broken link checker across
multiple pages. I pushed a version that was
marking LinkedIn URLs as broken links because
LinkedIn returns HTTP 999 to block bots.

The checker was flagging hundreds of LinkedIn
links as broken when they were actually fine.
This went into the automation suite and ran
on the CI pipeline. The team started seeing
hundreds of false positives in every run.

What happened: The reports were wrong. The team
stopped trusting the broken link checker entirely.
A tool that nobody trusts is worse than no tool.

What I learned: I had tested the happy path —
valid links return 200, broken links return 404.
I had not thought about what happens when a
server deliberately blocks our checker. I was
testing the tool, not the real world conditions
the tool would run in.

The fix was treating 999, 429, and 451 alongside
403 as "blocked but not broken". But the bigger
lesson was: test in conditions that match reality,
not just conditions that are easy to set up.

I think about that every time I write a test now.
What real world condition am I not accounting for?

---

## Q3 — What does this team need MOST right now?

A smoke test suite running on every push to main.

Not a comprehensive test strategy. Not 100% coverage.
Not a QA process document. One thing: automated
checks that run before any code reaches production.

Here is why I pick this over everything else:

Both production incidents this month happened because
broken code was pushed directly to main with no checks.
The env variable incident — a smoke test that checks
the app boots and the payroll endpoint responds would
have caught this in 30 seconds. The API route typo —
a smoke test hitting /api/attendance would have
returned 404 immediately.

Two incidents. Both preventable with 3-5 fast tests.

The team can debate test coverage and QA processes
later. But right now, today, there is nothing between
a developer pushing bad code and 200 workers not
getting paid. That gap needs to close first.

Everything else — regression suites, exploratory
testing, acceptance criteria — builds on top of
this foundation. Without it, all of that work
can be undone by one bad push.

---

## Q4 — How would I get the senior dev to care?

I would not walk in and tell him testing is important.
He has heard that before and he disagrees. Telling
him again just makes him dig in harder.

In my first week I would do two things:

First, I would ask him to show me the payroll module.
Not because I need help — because he knows things
I do not. Where are the tricky parts? What breaks
when new developers touch it? He has been here 3
years. That knowledge is valuable. I want to learn
from him, not teach him.

Second, I would show him BUG-003 and BUG-001 without
saying they are bugs. I would say: "When I was
exploring the system I noticed employee punch out
is not updating the attendance status. And payroll
is reading salaryAtJoining instead of the current
salary. Do you know if this is intentional?"

He will either know about it and explain why, which
teaches me something. Or he will not know about it,
which shows him that a fresh pair of eyes found
something in one day that has been quietly causing
wrong payslips for months.

I am not trying to prove he is wrong. I am showing
him that I found something real by testing the system
he built. That is different from saying "you need QA."

The goal is not to win the argument. The goal is to
make him curious about what else might be quietly
wrong. Curiosity is more powerful than conviction.

---

## Q5 — A personal system that connects to quality

During my internship I built a personal tracking
system for my own testing work. Just a spreadsheet
at first — what I tested, what I found, what I
still needed to check. It felt like overhead at
the start. Just more work on top of the actual work.

But after two weeks I noticed something. When I
came back to a feature I had tested before, I could
see exactly what I had checked and what I had not.
Without the tracker I would test the same obvious
things again and miss the edge cases I had planned
to check but forgotten.

The tracker worked not because it was technically
correct but because it matched how I actually work.
I forget things. I get distracted. I jump between
tasks. The system accounted for that.

This is what I think about when building quality
systems for a team. A perfect testing process that
nobody follows is worthless. A simple process that
fits how the team actually works — even if it is
not perfect — will be followed.

The senior dev fixes things from memory because
that is how he works. Fighting that is pointless.
The question is: how do I build a safety net that
works alongside his style, not against it?

Fast CI that barely changes his workflow.
Tests that document what he knows so new devs
do not need to ask him. Regression tests that
protect the payroll module he cares about.

The system has to fit the people. Otherwise it
will be ignored, and ignored quality systems
are just documentation nobody reads.