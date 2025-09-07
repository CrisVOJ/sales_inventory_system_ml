-- PERMISSIONS
INSERT INTO permissions (permission_id, "name")
VALUES (1,'READ'),(2,'CREATE'),(3,'UPDATE'),(4,'DELETE')
ON CONFLICT (permission_id) DO NOTHING;

-- ROLES
INSERT INTO roles (role_id, description, "name")
VALUES (1,'Administrador del sistema','ADMIN'),
       (2,'Empleado vendedor','SELLER')
ON CONFLICT (role_id) DO NOTHING;

-- RELACIÓN ROLE_PERMISSIONS (PK compuesta evita duplicados)
INSERT INTO role_permissions (permission_id, role_id) VALUES
                                                          (1,1),(2,1),(3,1),(4,1),(1,2),(2,2)
ON CONFLICT DO NOTHING;

-- USERS (usa PK user_id o UNIQUE en username)
INSERT INTO users (account_no_expired, account_no_locked, credential_no_expired, is_enabled,
                   user_id, address, email, identity_document, maternal_surname, "name",
                   "password", paternal_surname, phone, username)
VALUES
    (true,true,true,true,1,'address','admin@gmail.com','12345678','admin','admin',
     '$2a$10$7OHrppZRrgP24aYvYVZMfO6YN5OhDFDNicRdpsljnHPyilv3oyoqi','admin','1234567','admin'),
    (true,true,true,true,2,'address','seller@gmail.com','87654321','seller','seller',
     '$2a$10$7OHrppZRrgP24aYvYVZMfO6YN5OhDFDNicRdpsljnHPyilv3oyoqi','seller','1234567','seller')
ON CONFLICT (user_id) DO NOTHING;

-- USER_ROLES (PK compuesta evita duplicados)
INSERT INTO user_roles (role_id, user_id) VALUES (1,1),(2,2)
ON CONFLICT DO NOTHING;

-- UNITS
INSERT INTO units (name, active) VALUES
                                     ('unidad',true),('kg',true),('gramo',true),('litro',true)
ON CONFLICT (name) DO NOTHING;

-- LOCATIONS
INSERT INTO locations (code, name, active) VALUES
                                               ('A-B-1','Edificio A, Piso B, Estante 1',true),
                                               ('A-B-2','Edificio A, Piso B, Estante 2',true),
                                               ('A-B-3','Edificio A, Piso B, Estante 3',true)
ON CONFLICT (code) DO NOTHING;

-- SALE STATUSES
INSERT INTO sale_statuses (name, active) VALUES
                                             ('ACTIVO',true),('DEUDA',true),('PAGADO',true),('ANULADO',true)
ON CONFLICT (name) DO NOTHING;

-- PAYMENT METHODS
INSERT INTO payment_methods (name, active) VALUES
                                               ('QR',true),('Efectivo',true),('Transferencia',true)
ON CONFLICT (name) DO NOTHING;
