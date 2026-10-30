# Handoff prompt: EPIC Korea Scholarship Programme (paste this into the new Claude chat)

You are picking up an ongoing project for me. Read all of this before doing anything.

## Who I am and how I work
- I'm Ishara Madhusanka ("EPIC"), founder of Epic Campus (Pvt) Ltd, Galle, Sri Lanka. I work alone, no dev team.
- Talk to me casually, in plain English only (no Sinhala words in your replies). Short, practical answers.
- Money: always LKR. If USD ever comes in, keep LKR and USD as separate totals, never convert into one.
- I don't want things that look "AI made". Clean, professional, simple wording.
- Ask me before big rebuilds if something is unclear; otherwise just do it and tell me what you did.

## The programme
- **Korea Scholarship Programme, Batch 1**: a 30-day live-in course at Epic Campus, Galle, before students go to South Korea on university scholarships.
- **Dates:** Day 1 = Fri 30 Oct 2026, Day 30 = Sat 28 Nov 2026.
- **Students:** 11. Level is basic English, aiming for A2. Korean starts from zero.
- **Subjects:** English and Korean, roughly equal hours (about 94 h English, 87 h Korean). Each language has an IT lab practice slot.
- **Fee:** LKR 125,000 per student.

## Teachers
| Slot | Who | When | Pay |
|---|---|---|---|
| English Teacher 1 | **Anna** (Russian, TOEFL background), WhatsApp +7 987 907 6472 | **Wed, Thu, Sat 9:00–12:00 only**, 12 mornings from Wed 4 Nov to Sat 28 Nov (not Sat 31 Oct) | **Agreed:** LKR 1,800/h × 3 h = 5,400 a session → **64,800**; transport 2,600 a day → **31,200**; **total 96,000** |
| English Teacher 2 | "Sir": 077 127 5905 (normal calls), 072 127 5905 | Mon morning, Tue all day, Wed/Thu daytime. **Never Saturday, no evenings** | Suggested LKR 6,000/session, not agreed (8 sessions = 48,000) |
| English Teacher 3 | (name not given) | English afternoons 1:00–4:30 | **LKR 55,000/month, confirmed** |
| English Teacher 4 | TBC | Cover only | per session if used |
| Korean Teachers 1 and 2 | Campus staff | Korean mornings / afternoons | no extra cost |

## Current timetable (plan v5, made 29 Oct)
- **Wed, Thu, Sat:** English 9:00–12:00 with Anna. Students self-study 8:30–9:00. Lunch 12:00–1:00. **Korean** 1:00–4:30.
- **Anna's morning:** 9:00–10:30 grammar and writing, 10:30–10:45 tea, 10:45–12:00 speaking.
- **Other days:** **Korean** 8:30–11:30 (tea 10:00–10:15), lunch 11:30–1:00. **English** 1:00–4:30 with Teacher 3: reading 1:00–2:00, listening 2:15–3:15, IT lab 3:30–4:30.
- **Each English theme is taught twice:** grammar and speaking with Anna, reading and listening with Teacher 3.
- **Week 1 grammar foundation (Teacher 2):**
  - Day 1 (Fri 30 Oct): placement test 9:00–10:45 on epicielts.live, run by staff. Placement speaking + Foundation 1 (parts of speech) with Teacher 2 in the afternoon. **Still to confirm:** Teacher 2 on a Friday.
  - Day 4 (Mon): Foundation 2, sentence patterns (AM, Teacher 2) + Foundation 3, pronouns and prepositions (PM, Teacher 3).
  - Day 5 (Tue): Foundation 4, tenses + Foundation 5, conjunctions and week 1 quiz (Teacher 2).
- **All-Korean days:** 2, 3, 15, 29.
- **Tests:** English mid test Day 14, English final Day 28. Korean mid check Day 15, Korean final Day 29.
- **Mock scholarship interviews:** Teacher 2, side room during the afternoon lesson, on Days 12, 19, 26. Final mock interviews Day 28.
- **Evenings 6:30–7:30**, run by staff: Day 1 welcome night, Day 5 presentation night, Day 11 debate, Day 17 presentation, Day 23 debate, Day 30 graduation.
- **English themes (Anna AM day / Teacher 3 PM day):** Home & town (6/8), Food & shopping (7/10), Now & last weekend (9/11), Yesterday & school (13/12), Travel & health (16/17, review 18), Plans & careers (20/19), Studying in Korea (21/22), Emails & goals (23/24), The scholarship interview (27/25, review 26), Final presentations Day 30.
- **Korean** follows the 24 lessons on my Korean site, EStudykorea (https://estudy-topik.info-belearn.chatgpt.site), in order: alphabet warm-up, Hangul 1–12, Beginner 1 lessons 1–12, reviews, tests, and a self-introduction on Day 30 PM. The site has English, Sinhala and Korean explanations.

## Budget (Excel "Budget" tab)
- **Income:** 11 × 125,000 = 1,375,000. Campus share is 25,000 × 11 = 275,000, which leaves **1,100,000** to budget.
- **My split:** Campus 10% (100,000), Staff 40% (400,000), System 12% (120,000), Web 10% (100,000), Miscellaneous/transport 10% (100,000), Accommodation & food 30% (300,000).
- **The gap:** those percentages add up to **112%**. Against my own figures the budget is **20,000 over**. I haven't decided where the extra 100,000 from student 11 goes.
- **Teaching cost now:** Anna 96,000 incl. transport, Teacher 2 48,000 (suggested), Teacher 3 55,000, so **199,000 in total**, inside the 400,000 Staff line.

## What already exists
1. **Website:** https://epicielts.live. It's a React + Vite frontend and a Node/Express + Prisma (Neon Postgres) backend, hosted on Render.
   - **Repo:** github.com/epiccampusdigital-stack/epic-ielts. Work on branch `feature/korea-program`, then fast-forward `main` and push; Render deploys from `main`.
   - **Main features:**
     - IELTS and General English tracks (students choose at signup or login), and the General English placement test (score out of 100 + CEFR level).
     - Admin panel switch between IELTS and General English.
     - Programme tracker at /admin/program: days, sessions, attendance, WhatsApp reminders, pause button, and a "Rebuild schedule" banner when the plan changes.
   - **Timetable source:** `backend/src/data/program/koreaBatch1.js` (PLAN_ID `plan-v5-anna-wed-thu-sat`). Edit this to change the timetable, push, then click **Rebuild schedule** in the tracker. Rebuild is refused once attendance has been taken; after that, change sessions one by one in the tracker.
   - **Rules:** never break the exam flows. Prisma migrations are additive only: never run `db push --accept-data-loss` or `migrate reset`. AI marking runs once per attempt.
   - **WhatsApp:** YCloud on +94 76 380 8383 (coexistence). Template `teacher_reminder` (Utility). Render env vars: `YCLOUD_API_KEY`, `WHATSAPP_FROM=+94763808383`, `WHATSAPP_TEMPLATE=teacher_reminder`, `WHATSAPP_TEMPLATE_LANG=en`. Never ask me to paste API keys into the chat.
2. **Printed documents** (A4 PDF, site theme: navy #002761, blue #0056d2, Source Sans Pro):
   - 1 Teacher proposal, 2 Course structure, 3 English level guide, 4 "What changed" sheet (29 Oct).
3. **English lesson papers:** student worksheet + teacher notes for every lesson.
   - The zip `EPIC English papers.zip` has "By day" and "By skill" folders, with short names so Windows can extract it.
   - 14 older easy lessons are kept as "Extra practice".
4. **Workbooks** (A4 colour, my own drawn pictures, answers at the back, kept in the book):
   - English Workbooks 1–4: Grammar foundation / Daily life / Past and future / Scholarship ready.
   - Korean Workbooks 1–4, built from the EStudykorea lessons, with English and Sinhala explanations: Hangul foundations / Reading Hangul / First conversations / Everyday Korean.
5. **Anna's pack:**
   - 1 fee breakdown (with signature lines; payment method left blank)
   - 2 her schedule
   - 3 course structure
   - 4 teaching pack (66 pages, all her lessons)
6. **Excel `Korea_Program_30Day_Calendar.xlsx`:** Overview, Budget, Spending log, Calendar (one row per session), Grid, Days, and one tab per teacher (one row per session).
7. **Other:** WhatsApp group picture, OG image, favicon.

## How to rebuild any document
All build scripts are in the repo under `programme-materials/`. Do this first:
```
git clone https://github.com/epiccampusdigital-stack/epic-ielts && cd epic-ielts && git checkout feature/korea-program
bash programme-materials/setup.sh      # copies everything to /tmp/epicwork, makes plan.json, installs the Sinhala font
pip install playwright pypdf openpyxl --break-system-packages   # if missing; Chromium is needed for PDFs
```
The scripts look for Chromium at `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. If yours is elsewhere, change `executable_path` in the scripts, or delete it so Playwright uses its own. The Korean font is the system "Noto Sans CJK KR" (`apt install fonts-noto-cjk` if missing).

Then, from `/tmp/epicwork`:
- **Lesson papers:** `cd papers && python3 render.py && python3 byday.py && python3 shortzip.py`
  - Lesson content is in `papers/content/*.py`; `render.py` maps lessons to the plan v5 days.
- **Workbooks:** `cd books && python3 kbooks.py` (Korean) and `python3 ebooks.py` (English). Build the papers first.
  - The Korean data is in `books/korean.json`, exported from the EStudykorea site files.
- **Anna's pack:** `cd books && python3 anna.py`
- **Printed docs:** `cd print && python3 build.py`
- **Excel:** `python3 build_xlsx.py`, which runs `budget_sheet.py`. It writes `/home/claude/deliverables/Korea_Program_30Day_Calendar.xlsx`.
- **Order after any timetable change:** edit `koreaBatch1.js` → rerun `setup.sh` (it regenerates plan.json) → papers → workbooks → anna → print → excel → push the repo.

## Open items / next steps
- Confirm Teacher 2 for Friday Day 1 afternoon.
- Confirm Teacher 3 is OK with Sunday afternoons (Days 10, 17, 24).
- Agree Teacher 2's fee. Decide where the extra 100,000 goes and fix the 112% split.
- Payment method and dates on Anna's fee sheet.
- WhatsApp: template approval, YCloud wallet top-up, test reminder from the tracker.
- After deploying, click "Rebuild schedule" in the tracker before attendance starts.
- Set CRON_SECRET + a cron-job.org job hitting the tracker tick so reminders send on time.
