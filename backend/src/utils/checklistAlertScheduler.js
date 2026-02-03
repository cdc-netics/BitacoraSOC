const AppConfig = require('../models/AppConfig');
const ShiftCheck = require('../models/ShiftCheck');
const ShiftAssignment = require('../models/ShiftAssignment');
const ShiftOverride = require('../models/ShiftOverride');
const ExternalPerson = require('../models/ExternalPerson');
const User = require('../models/User');
const { logger } = require('./logger');
const { sendChecklistAlertEmail } = require('../routes/smtp');

const DEFAULT_ALERT_TIME = '09:30';

const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

const buildCutoffTime = (now, time) => {
  const [hourStr, minuteStr] = (time || DEFAULT_ALERT_TIME).split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const cutoff = new Date(now);
  cutoff.setHours(Number.isFinite(hour) ? hour : 9, Number.isFinite(minute) ? minute : 30, 0, 0);
  return cutoff;
};

const resolveShiftAssignee = async (roleCode, now) => {
  const override = await ShiftOverride.findOne({
    roleCode,
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('replacementUserId', 'fullName username email role cargoLabel');

  if (override && override.replacementUserId?.email) {
    return {
      email: override.replacementUserId.email,
      name: override.replacementUserId.fullName || override.replacementUserId.username || 'Usuario'
    };
  }

  const assignment = await ShiftAssignment.findOne({
    roleCode,
    weekStartDate: { $lte: now },
    weekEndDate: { $gte: now }
  }).populate('userId', 'fullName username email role cargoLabel')
    .populate('externalPersonId', 'name email');

  if (assignment?.userId?.email) {
    return {
      email: assignment.userId.email,
      name: assignment.userId.fullName || assignment.userId.username || 'Usuario'
    };
  }

  if (assignment?.externalPersonId?.email) {
    return {
      email: assignment.externalPersonId.email,
      name: assignment.externalPersonId.name || 'Persona externa'
    };
  }

  return null;
};

const getChecklistAlertRecipients = async (now) => {
  const recipients = new Map();

  const n1Assignee = await resolveShiftAssignee('N1_NO_HABIL', now);
  if (n1Assignee?.email) {
    recipients.set(n1Assignee.email, n1Assignee.name);
  }

  const n2Users = await User.find({
    isActive: true,
    cargoLabel: { $regex: /^N2$/i }
  }).select('email fullName username role cargoLabel');

  n2Users.forEach(user => {
    if (!user.email) return;
    recipients.set(user.email, user.fullName || user.username || 'Usuario');
  });

  return Array.from(recipients.keys());
};

const shouldSendAlert = async (now, config) => {
  if (!config?.checklistAlertEnabled) return false;

  const cutoff = buildCutoffTime(now, config.checklistAlertTime || DEFAULT_ALERT_TIME);
  if (now < cutoff) return false;

  if (config.lastChecklistAlertDate && isSameDay(config.lastChecklistAlertDate, now)) {
    return false;
  }

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const hasCheck = await ShiftCheck.exists({
    type: 'inicio',
    createdAt: { $gte: start, $lte: end }
  });

  return !hasCheck;
};

const runChecklistAlert = async () => {
  try {
    const config = await AppConfig.findOne();
    const now = new Date();

    if (!config) return;
    const shouldSend = await shouldSendAlert(now, config);
    if (!shouldSend) return;

    const recipients = await getChecklistAlertRecipients(now);

    await sendChecklistAlertEmail({
      recipients,
      alertTime: config.checklistAlertTime || DEFAULT_ALERT_TIME,
      dateLabel: now.toLocaleDateString('es-CL')
    });

    config.lastChecklistAlertDate = now;
    await config.save();
  } catch (error) {
    logger.error({ err: error }, 'Error ejecutando alerta de checklist');
  }
};

const startChecklistAlertScheduler = () => {
  const intervalMs = 5 * 60 * 1000;
  runChecklistAlert();
  setInterval(runChecklistAlert, intervalMs);
};

module.exports = {
  startChecklistAlertScheduler
};
