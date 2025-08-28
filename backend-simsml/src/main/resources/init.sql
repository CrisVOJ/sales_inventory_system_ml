INSERT INTO permissions
(permission_id, "name") values
                            (1, 'READ'),
                            (2, 'CREATE'),
                            (3, 'UPDATE'),
                            (4, 'DELETE');

INSERT INTO roles
(role_id, description, "name") values
                                   (1, 'Administrador del sistema', 'ADMIN'),
                                   (2, 'Empleado vendedor', 'SELLER');

INSERT INTO role_permissions
(permission_id, role_id) values
                             (1, 1),
                             (2, 1),
                             (3, 1),
                             (4, 1),
                             (1, 2),
                             (2, 2);

INSERT INTO users
(account_no_expired, account_no_locked, credential_no_expired, is_enabled, user_id, address, email, identity_document, maternal_surname, "name", "password", paternal_surname, phone, username) values
                                                                                                                                                                                                    (true, true, true, true, 1, 'address', 'admin@gmail.com', '12345678', 'admin', 'admin', '$2a$10$7OHrppZRrgP24aYvYVZMfO6YN5OhDFDNicRdpsljnHPyilv3oyoqi', 'admin', '1234567', 'admin'),
                                                                                                                                                                                                    (true, true, true, true, 2, 'address', 'seller@gmail.com', '87654321', 'seller', 'seller', '$2a$10$7OHrppZRrgP24aYvYVZMfO6YN5OhDFDNicRdpsljnHPyilv3oyoqi', 'seller', '1234567', 'seller');

INSERT INTO user_roles
(role_id, user_id) values
                       (1, 1),
                       (2, 2);
INSERT INTO units
(name, active) VALUES
                   ('unidad', true),
                   ('kg', true),
                   ('gramo', true),
                   ('litro', true);

INSERT INTO locations
(code, name, active) VALUES
                         ('A-B-1', 'Edificio A, Piso B, Estante 1', true),
                         ('A-B-2', 'Edificio A, Piso B, Estante 2', true),
                         ('A-B-3', 'Edificio A, Piso B, Estante 3', true);

INSERT INTO sale_statuses
(name, active) VALUES
                   ('ACTIVO', true),
                   ('DEUDA', true),
                   ('PAGADO', true),
                   ('ANULADO', true);