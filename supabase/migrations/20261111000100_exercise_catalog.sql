-- Areté · Catálogo inicial de exercícios (user_id nulo = visível para todos, somente leitura).
-- Fica numa migration, e não no seed.sql, para chegar também ao banco de produção.

insert into public.exercises (user_id, name, muscle_group) values
  -- Peito
  (null, 'Supino reto com barra', 'peito'),
  (null, 'Supino reto com halteres', 'peito'),
  (null, 'Supino inclinado com barra', 'peito'),
  (null, 'Supino inclinado com halteres', 'peito'),
  (null, 'Supino declinado', 'peito'),
  (null, 'Crucifixo com halteres', 'peito'),
  (null, 'Crucifixo na máquina (peck deck)', 'peito'),
  (null, 'Crossover na polia', 'peito'),
  (null, 'Flexão de braço', 'peito'),
  -- Costas
  (null, 'Puxada frontal na polia', 'costas'),
  (null, 'Barra fixa', 'costas'),
  (null, 'Remada curvada com barra', 'costas'),
  (null, 'Remada unilateral com halter', 'costas'),
  (null, 'Remada baixa na polia', 'costas'),
  (null, 'Remada cavalinho', 'costas'),
  (null, 'Pulldown com braços estendidos', 'costas'),
  (null, 'Levantamento terra', 'costas'),
  -- Ombros
  (null, 'Desenvolvimento com halteres', 'ombros'),
  (null, 'Desenvolvimento militar com barra', 'ombros'),
  (null, 'Elevação lateral', 'ombros'),
  (null, 'Elevação frontal', 'ombros'),
  (null, 'Crucifixo inverso', 'ombros'),
  (null, 'Face pull', 'ombros'),
  (null, 'Encolhimento com halteres', 'ombros'),
  -- Bíceps
  (null, 'Rosca direta com barra', 'biceps'),
  (null, 'Rosca alternada com halteres', 'biceps'),
  (null, 'Rosca martelo', 'biceps'),
  (null, 'Rosca Scott', 'biceps'),
  (null, 'Rosca na polia', 'biceps'),
  -- Tríceps
  (null, 'Tríceps na polia (corda)', 'triceps'),
  (null, 'Tríceps na polia (barra)', 'triceps'),
  (null, 'Tríceps testa', 'triceps'),
  (null, 'Tríceps francês', 'triceps'),
  (null, 'Mergulho nas paralelas', 'triceps'),
  -- Antebraço
  (null, 'Rosca de punho', 'antebraco'),
  -- Quadríceps
  (null, 'Agachamento livre', 'quadriceps'),
  (null, 'Agachamento no Smith', 'quadriceps'),
  (null, 'Leg press 45°', 'quadriceps'),
  (null, 'Cadeira extensora', 'quadriceps'),
  (null, 'Afundo com halteres', 'quadriceps'),
  (null, 'Agachamento búlgaro', 'quadriceps'),
  (null, 'Hack squat', 'quadriceps'),
  -- Posterior
  (null, 'Mesa flexora', 'posterior'),
  (null, 'Cadeira flexora', 'posterior'),
  (null, 'Stiff', 'posterior'),
  -- Glúteos
  (null, 'Elevação pélvica', 'gluteos'),
  (null, 'Cadeira abdutora', 'gluteos'),
  (null, 'Glúteo na polia', 'gluteos'),
  -- Panturrilha
  (null, 'Panturrilha em pé', 'panturrilha'),
  (null, 'Panturrilha sentado', 'panturrilha'),
  -- Abdômen
  (null, 'Abdominal na máquina', 'abdomen'),
  (null, 'Abdominal infra', 'abdomen'),
  (null, 'Prancha', 'abdomen');
