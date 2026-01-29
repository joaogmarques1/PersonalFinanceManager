-- Intentionally blank. Database schema is managed externally.
-- Tabela: users
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense'))
);

-- Seed initial categories
INSERT INTO public.categories (name, type) VALUES
    ('Salário', 'income'),
    ('Investimentos inflows', 'income'),
    ('Rendas', 'income'),
    ('Investimentos outflows', 'expense'),
    ('Outras receitas', 'income'),
    ('Outras despesas', 'expense'),
    ('Casa', 'expense'),
    ('Carro e uso', 'expense'),
    ('Entretenimento', 'expense'),
    ('Subscrições', 'expense'),
    ('Vestuário', 'expense'),
    ('Alimentação', 'expense'),
    ('Saúde', 'expense'),
    ('Educação', 'expense'),
    ('Transporte', 'expense'),
    ('Compras', 'expense'),
    ('Devoluções', 'income'),
    ('Pagamento de dívidas', 'expense'),
    ('Impostos', 'expense'),
    ('Reembolso de impostos', 'income');

CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cartão de crédito', 'Cartão de débito','Transferência bancária', 'Dinheiro', 'Outro')),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL

);

CREATE TABLE IF NOT EXISTS public.credit_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    credit_card_limit NUMERIC(10,2) NOT NULL,
    interest_rate NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: loans
CREATE TABLE IF NOT EXISTS public.loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,              -- Ex: "Carro", "Cartão de crédito", "Crédito Habitação"
    principal NUMERIC(10,2) NOT NULL,        -- Valor total do empréstimo
    used_credit_card INTEGER REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    interest_rate NUMERIC(5,2),              -- Taxa anual (%)
    start_date DATE NOT NULL,
    end_date DATE,
    total_installments INTEGER,              -- Nº de prestações
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);


CREATE TABLE IF NOT EXISTS public.business(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    UNIQUE (tax_id, country),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.business_members(
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES public.business(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member','viewer', 'invited')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.business_transactions_categories(
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES public.business(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.business_transactions(
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES public.business(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    counterparty_name VARCHAR(100) NOT NULL,
    counterparty_tax_id VARCHAR(20) NOT NULL,
    counterparty_country VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES public.business_transactions_categories(id) ON DELETE SET NULL,
    description TEXT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    net_amount NUMERIC(10,2) NOT NULL CHECK (net_amount >= 0),
    vat_rate NUMERIC(5,2) CHECK (vat_rate >= 0),
    vat_amount NUMERIC(10,2) NOT NULL CHECK (vat_amount >= 0),
    vat_exemption BOOLEAN NOT NULL,
    withholding_tax_amount NUMERIC(5,2) CHECK (withholding_tax_amount >= 0),
    gross_amount NUMERIC(10,2) NOT NULL CHECK (gross_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cartão de crédito', 'Cartão de débito','Transferência bancária', 'Dinheiro', 'Outro')),
    invoice_number VARCHAR(50),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
)
