const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware: requirePaidOrFirstExam
 *
 * - Admins and Teachers: always pass through
 * - Paid students: always pass through
 * - Free students: only allowed to access the first paper per testType
 *   (lowest order ASC, then paperCode ASC). All others return 403 PAYMENT_REQUIRED.
 */
async function requirePaidOrFirstExam(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Admins/Teachers always pass
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return next();

    const { paperId } = req.body;
    if (!paperId) return res.status(400).json({ error: 'paperId is required' });

    // Check if student is paid
    const student = await prisma.student.findUnique({
      where: { id: user.id },
      select: { isPaid: true }
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.isPaid) return next();

    // Not paid — find the paper's testType
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(paperId) },
      select: { id: true, testType: true, order: true, paperCode: true }
    });

    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    // Find the first paper of this testType (lowest order, then paperCode)
    const firstPaper = await prisma.paper.findFirst({
      where: {
        testType: paper.testType,
        status: 'PUBLISHED'
      },
      orderBy: [
        { order: 'asc' },
        { paperCode: 'asc' }
      ],
      select: { id: true }
    });

    if (firstPaper && firstPaper.id === paper.id) {
      // This is the free paper — allow it
      return next();
    }

    return res.status(403).json({
      error: 'PAYMENT_REQUIRED',
      message: `Unlock all ${paper.testType.toLowerCase()} tests with full access for LKR 10,000.`,
      upgradeUrl: '/upgrade'
    });
  } catch (err) {
    console.error('Access control error:', err);
    res.status(500).json({ error: 'Access check failed' });
  }
}

module.exports = { requirePaidOrFirstExam };
