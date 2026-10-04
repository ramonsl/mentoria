-- Migrates `enrollments` from the 2-plan model (primeira-vaga/proximo-nivel,
-- always 6 months of access) to the 3-plan model (avulso/acompanhamento-3m/
-- acompanhamento-6m, access duration per plan). See design.md "Addendum: 3
-- planos + envio assíncrono" for the authoritative shape.
--
-- "avulso" has no Classroom/WhatsApp trilha, so it never expires - expires_at
-- must accept NULL for it (lib/enrollments.ts createEnrollment computes
-- expiresAt = null for that plan).
--
-- No existing rows use the old plan values yet (pre-launch, no production
-- domain configured - content.md §14 item 4), so this drops and recreates
-- the check constraint directly instead of migrating data.

alter table enrollments
  drop constraint enrollments_plan_check;

alter table enrollments
  add constraint enrollments_plan_check
  check (plan in ('avulso', 'acompanhamento-3m', 'acompanhamento-6m'));

alter table enrollments
  alter column expires_at drop not null;
