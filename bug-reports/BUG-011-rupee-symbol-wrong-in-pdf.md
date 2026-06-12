# BUG-011 — Rupee Symbol Displays as Wrong Character in Payslip PDF

**Severity:** Low
**Module:** Payroll / PDF Generation
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I downloaded payslip PDFs for multiple employees.
In every PDF the rupee symbol ₹ is displaying as 
¹ (superscript 1). This affects all salary values 
on the payslip making it look unprofessional and 
potentially confusing for workers.

## Steps
1. Login as Admin
2. Go to Payroll
3. Generate payroll for any employee
4. Click Download Payslip
5. Open the downloaded PDF

## What I expected
Currency symbol displayed as: ₹50,000

## What actually happened
Currency symbol displayed as: ¹50,000

Affects all salary fields:
- Basic Salary: ¹50000
- HRA: ¹20000
- Gross Salary: ¹80000
- Net Salary: ¹84000

## Proof
- Downloaded payslip PDF for Asha Verma shows ¹
- Downloaded payslip PDF for Priya Nair shows ¹
- All salary values affected across all payslips

## Who gets hurt
Every worker who downloads their payslip sees 
wrong currency symbol. Official payslip document 
looks incorrect. Workers may question validity 
of the document when submitting for loans or 
visa applications.

## Why this is Low
Does not affect actual salary calculation.
Pure display issue.
But payslip is an official document — presentation matters.

## Root cause
PDFKit default font does not support the ₹ 
Unicode character (U+20B9). When the character 
cannot be rendered, PDFKit substitutes it with 
the closest available character which appears 
as ¹. Fix requires either embedding a font that 
supports the rupee symbol or using INR as 
text alternative.