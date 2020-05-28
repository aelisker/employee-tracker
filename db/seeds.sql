INSERT INTO department (name)
VALUES
  ('I.T.'),
  ('Sales'),
  ('Application Development'),
  ('H.R.'),
  ('Marketing'),
  ('Finance and Accounting');

INSERT INTO role (title, salary, department_id)
VALUES
  ('I.T. Helpdesk', 60000, 1),
  ('Systems Admin', 90000, 1),
  ('Product Specialist', 50000, 2),
  ('Sales Lead', 65000, 2),
  ('Frontend Developer', 100000, 3),
  ('Backend Developer', 105000, 3),
  ('H.R. Staff', 68000, 4),
  ('Social Media Marketer', 70000, 5),
  ('Traditional Marketing', 72000, 5),
  ('In House Accountant', 85000, 6),
  ('Financial Analyst', 80000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Bob', 'Smith', 1, 2),
  ('Jane', 'Smith', 2, NULL),
  ('Igor', 'Oliver', 3, 4),
  ('Jane', 'Fonda', 4, NULL),
  ('Darlene', 'Alderson', 5, NULL),
  ('Elliot', 'Alderson', 6, NULL),
  ('Gordon', 'Clark', 6, NULL),
  ('Toby', 'Flenderson', 7, NULL),
  ('Anna', 'Scott', 8, 10),
  ('Kyle', 'Nguyen', 9, NULL),
  ('Tenzin', 'Gylapo', 10, NULL),
  ('Jack', 'Ryan', 11, NULL);