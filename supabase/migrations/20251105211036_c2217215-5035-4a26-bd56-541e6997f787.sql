-- Activer tous les livreurs existants pour permettre l'assignation automatique
UPDATE user_roles 
SET is_active = true 
WHERE role = 'livreur';