const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Maps a paper code (e.g. "004") to its required level number (1-5).
 * Codes 001-003 → Level 1 (but 001 is always free as placement)
 * Codes 004-006 → Level 2
 * Codes 007-009 → Level 3
 * Codes 010-012 → Level 4
 * Codes 013-015 → Level 5
 */
function requiredLevelForCode(paperCode) {
  const n = parseInt(paperCode, 10);
  if (n <= 3)  return 1;
  if (n <= 6)  return 2;
  if (n <= 9)  return 3;
  if (n <= 12) return 4;
  return 5;
}

/**
 * Middleware: requirePaidOrFirstExam
 *
 * Access rules (in priority order):
 *  1. Admins / Teachers → always allowed
 *  2. Paper code === '001' → always free (placement test)
 *  3. Student has hasFullAccess OR isPaid (legacy full-access) → allowed
 *  4. Student has purchased the specific level for this paper → allowed
 *  5. Otherwise → 403 PAYMENT_REQUIRED with requiredLevel
 */
async function requirePaidOrFirstExam(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Admins/Teachers always pass
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return next();

    const { paperId } = req.body;
    if (!paperId) return res.status(400).json({ error: 'paperId is required' });

    // Fetch paper
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(paperId) },
      select: { id: true, testType: true, paperCode: true, status: true }
    });
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    // Rule 2: paper code 001 is always free (placement test)
    if (paper.paperCode === '001') return next();

    // Fetch student with purchased levels
    const student = await prisma.student.findUnique({
      where: { id: user.id },
      select: { isPaid: true, hasFullAccess: true, studentLevels: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Rule 3: legacy isPaid or hasFullAccess → full access
    if (student.hasFullAccess || student.isPaid) return next();

    // Rule 4: check if student purchased the level for this paper
    const requiredLevel = requiredLevelForCode(paper.paperCode);
    const hasLevel = student.studentLevels.some(
      sl => sl.levelNumber === requiredLevel || sl.levelNumber === 99
    );
    if (hasLevel) return next();

    // Rule 5: blocked
    return res.status(403).json({
      error: 'PAYMENT_REQUIRED',
      requiredLevel,
      message: `Purchase Level ${requiredLevel} (LKR 2,000) or Full Access (LKR 10,000) to access this paper.`,
      upgradeUrl: '/levels',
    });
  } catch (err) {
    console.error('Access control error:', err);
    res.status(500).json({ error: 'Access check failed' });
  }
}

module.exports = { requirePaidOrFirstExam };
