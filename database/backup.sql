--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-05-02 12:38:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 36833)
-- Name: budgets; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.budgets (
    id bigint NOT NULL,
    workspace_id bigint NOT NULL,
    category_id bigint NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT budgets_month_check CHECK (((month >= 1) AND (month <= 12)))
);


ALTER TABLE public.budgets OWNER TO ferram;

--
-- TOC entry 233 (class 1259 OID 36832)
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.budgets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budgets_id_seq OWNER TO ferram;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 233
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- TOC entry 222 (class 1259 OID 35303)
-- Name: categories; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    workspace_id bigint,
    name character varying(100) NOT NULL,
    monthly_budget numeric(15,2) DEFAULT 0,
    parent_id bigint,
    is_project boolean DEFAULT false
);


ALTER TABLE public.categories OWNER TO ferram;

--
-- TOC entry 221 (class 1259 OID 35302)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO ferram;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 226 (class 1259 OID 35337)
-- Name: financial_goals; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.financial_goals (
    id bigint NOT NULL,
    user_id bigint,
    name character varying(100) NOT NULL,
    target_amount numeric(15,2) NOT NULL,
    current_amount numeric(15,2) DEFAULT 0,
    deadline date
);


ALTER TABLE public.financial_goals OWNER TO ferram;

--
-- TOC entry 225 (class 1259 OID 35336)
-- Name: financial_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.financial_goals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_goals_id_seq OWNER TO ferram;

--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 225
-- Name: financial_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.financial_goals_id_seq OWNED BY public.financial_goals.id;


--
-- TOC entry 229 (class 1259 OID 35452)
-- Name: partners; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.partners (
    id bigint NOT NULL,
    workspace_id bigint,
    name character varying(100) NOT NULL,
    percentage numeric(5,2) NOT NULL,
    email character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT partners_percentage_check CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)))
);


ALTER TABLE public.partners OWNER TO ferram;

--
-- TOC entry 230 (class 1259 OID 35456)
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.partners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partners_id_seq OWNER TO ferram;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 230
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- TOC entry 228 (class 1259 OID 35355)
-- Name: projects; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    workspace_id bigint,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.projects OWNER TO ferram;

--
-- TOC entry 227 (class 1259 OID 35354)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO ferram;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 227
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 224 (class 1259 OID 35316)
-- Name: transactions; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    workspace_id bigint,
    category_id bigint,
    amount numeric(15,2) NOT NULL,
    description text,
    is_essential boolean DEFAULT true,
    date date DEFAULT CURRENT_DATE,
    project_id bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    wallet_id bigint
);


ALTER TABLE public.transactions OWNER TO ferram;

--
-- TOC entry 223 (class 1259 OID 35315)
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO ferram;

--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 223
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 218 (class 1259 OID 35279)
-- Name: users; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO ferram;

--
-- TOC entry 217 (class 1259 OID 35278)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ferram;

--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 232 (class 1259 OID 36813)
-- Name: wallets; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.wallets (
    id bigint NOT NULL,
    workspace_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    balance numeric(15,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'MXN'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wallets OWNER TO ferram;

--
-- TOC entry 231 (class 1259 OID 36812)
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_id_seq OWNER TO ferram;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 231
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- TOC entry 220 (class 1259 OID 35289)
-- Name: workspaces; Type: TABLE; Schema: public; Owner: ferram
--

CREATE TABLE public.workspaces (
    id bigint NOT NULL,
    user_id bigint,
    name character varying(100) NOT NULL,
    is_professional boolean DEFAULT false,
    currency character varying(10) DEFAULT 'MXN'::character varying
);


ALTER TABLE public.workspaces OWNER TO ferram;

--
-- TOC entry 219 (class 1259 OID 35288)
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: ferram
--

CREATE SEQUENCE public.workspaces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspaces_id_seq OWNER TO ferram;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 219
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- TOC entry 4803 (class 2604 OID 36836)
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 35306)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 35340)
-- Name: financial_goals id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals ALTER COLUMN id SET DEFAULT nextval('public.financial_goals_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 35457)
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 35358)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 35319)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 35282)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 36816)
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 35292)
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- TOC entry 5006 (class 0 OID 36833)
-- Dependencies: 234
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.budgets (id, workspace_id, category_id, amount, month, year, created_at) FROM stdin;
\.


--
-- TOC entry 4994 (class 0 OID 35303)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.categories (id, workspace_id, name, monthly_budget, parent_id, is_project) FROM stdin;
2	2	Software/SaaS	0.00	\N	f
3	2	RazoConnect	0.00	2	f
4	2	Azure	0.00	3	f
5	2	Azure App service	0.00	4	f
8	2	Bandwidth	0.00	4	f
7	2	Redis Cache	0.00	4	f
9	2	Claude Credits	0.00	3	f
10	2	Azure DB Postgres	0.00	4	f
14	1	Bank account	0.00	\N	f
15	1	Banamex	0.00	14	f
1	1	Food	3000.00	\N	f
16	1	Travel	0.00	\N	f
17	1	Investment (xCore)	0.00	\N	f
18	1	Personal Perks	0.00	\N	f
\.


--
-- TOC entry 4998 (class 0 OID 35337)
-- Dependencies: 226
-- Data for Name: financial_goals; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.financial_goals (id, user_id, name, target_amount, current_amount, deadline) FROM stdin;
1	1	First 100k 	100000.00	0.00	\N
2	1	Porsche 911 carrera	2578000.00	0.00	\N
\.


--
-- TOC entry 5001 (class 0 OID 35452)
-- Dependencies: 229
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.partners (id, workspace_id, name, percentage, email, created_at) FROM stdin;
3	2	Fernando García	30.00	\N	2026-03-02 17:32:03.057497
4	2	Fernando Ramírez	70.00	\N	2026-03-02 17:32:14.383461
\.


--
-- TOC entry 5000 (class 0 OID 35355)
-- Dependencies: 228
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.projects (id, workspace_id, name, description) FROM stdin;
\.


--
-- TOC entry 4996 (class 0 OID 35316)
-- Dependencies: 224
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.transactions (id, workspace_id, category_id, amount, description, is_essential, date, project_id, created_at, wallet_id) FROM stdin;
5	2	5	-217.59	Azure App Service February 2026	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
6	2	10	-202.87	Azure DB February 2026	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
7	2	7	-23.89	Azure Redis February 2026	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
8	2	9	-259.65	Windsurf Monthly payment	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
9	2	9	-173.10	Windsurf Credits	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
10	1	15	334.54	Balance 	t	2026-03-03	\N	2026-03-08 17:45:20.613894-06	\N
12	1	15	300.00	Daily college 	f	2026-03-04	\N	2026-03-08 17:45:20.613894-06	\N
13	1	1	-239.00	Rebel basketball Team	t	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
14	1	16	-84.00	Uber to CU	t	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
15	1	15	300.00	Daily college 	f	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
16	2	9	-183.67	Windsurf extra credits	t	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
17	1	17	-183.67	xCore Investment	t	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
18	1	1	-50.00	Coffee	t	2026-03-05	\N	2026-03-08 17:45:20.613894-06	\N
19	1	1	-170.00	Tortas	t	2026-03-08	\N	2026-03-08 17:45:20.613894-06	\N
20	1	1	-75.00	Breakfast	t	2026-03-08	\N	2026-03-08 17:45:20.613894-06	\N
21	1	15	-26.10	Diff	t	2026-03-08	\N	2026-03-08 17:45:20.613894-06	\N
22	1	15	300.00	Daily college 	f	2026-03-09	\N	2026-03-09 09:04:40.846-06	\N
23	1	1	-130.00	Food	t	2026-03-09	\N	2026-03-09 12:51:32.851998-06	\N
24	1	18	-135.00	Plants	t	2026-03-09	\N	2026-03-09 12:51:51.51143-06	\N
25	1	17	1000.00	xCore Investment	f	2026-03-09	\N	2026-03-09 14:09:47.523029-06	\N
26	2	5	-217.59	Azure App Service	t	2026-03-09	\N	2026-03-09 14:16:05.219415-06	\N
27	2	10	-202.87	Azure Database	t	2026-03-09	\N	2026-03-09 14:16:30.135641-06	\N
28	2	7	-23.89	Azure Redis	t	2026-03-09	\N	2026-03-09 14:17:16.672324-06	\N
29	1	17	-444.35	xCore Investment	t	2026-03-09	\N	2026-03-09 16:21:24.931461-06	\N
30	2	9	-183.53	AI Credits	t	2026-03-09	\N	2026-03-09 16:52:26.783236-06	\N
31	1	1	-67.00	Food	t	2026-03-09	\N	2026-03-10 13:32:30.668207-06	\N
32	1	1	-190.00	Food	t	2026-03-09	\N	2026-03-10 13:32:45.218292-06	\N
33	1	15	300.00	Daily college 	f	2026-03-10	\N	2026-03-10 13:33:05.250708-06	\N
34	1	15	-13.52	Diff	t	2026-03-10	\N	2026-03-10 13:38:17.11998-06	\N
35	1	1	-36.50	Oxxo	t	2026-03-11	\N	2026-03-10 21:23:41.390983-06	\N
36	1	17	-183.36	xCore Investment	t	2026-03-11	\N	2026-03-11 08:40:09.118059-06	\N
37	1	1	-60.00	Food	t	2026-03-11	\N	2026-03-11 14:21:03.292597-06	\N
38	1	15	250.00	Daily college 	f	2026-03-11	\N	2026-03-11 14:32:11.928478-06	\N
39	1	1	-160.00	Food	t	2026-03-12	\N	2026-03-11 22:00:19.454056-06	\N
40	1	17	-457.87	Azure	t	2026-03-12	\N	2026-03-11 22:10:48.139466-06	\N
\.


--
-- TOC entry 4990 (class 0 OID 35279)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.users (id, name, email, created_at) FROM stdin;
1	Founder	dferramm@gmail.com	2026-02-27 22:56:13.888352
\.


--
-- TOC entry 5004 (class 0 OID 36813)
-- Dependencies: 232
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.wallets (id, workspace_id, name, balance, currency, created_at) FROM stdin;
\.


--
-- TOC entry 4992 (class 0 OID 35289)
-- Dependencies: 220
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.workspaces (id, user_id, name, is_professional, currency) FROM stdin;
1	1	Personal	f	MXN
2	1	xCore (Startup)	t	MXN
\.


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 233
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.budgets_id_seq', 1, false);


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.categories_id_seq', 18, true);


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 225
-- Name: financial_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.financial_goals_id_seq', 2, true);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 230
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.partners_id_seq', 4, true);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 227
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 223
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.transactions_id_seq', 40, true);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 231
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.wallets_id_seq', 1, false);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 219
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 2, true);


--
-- TOC entry 4828 (class 2606 OID 36843)
-- Name: budgets budgets_category_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_month_year_key UNIQUE (category_id, month, year);


--
-- TOC entry 4830 (class 2606 OID 36841)
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 35309)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 35343)
-- Name: financial_goals financial_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT financial_goals_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 35459)
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 35362)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 35325)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 35287)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4811 (class 2606 OID 35285)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 36821)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 4813 (class 2606 OID 35296)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 1259 OID 35466)
-- Name: idx_partners_workspace_id; Type: INDEX; Schema: public; Owner: ferram
--

CREATE INDEX idx_partners_workspace_id ON public.partners USING btree (workspace_id);


--
-- TOC entry 4842 (class 2606 OID 36849)
-- Name: budgets budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 36844)
-- Name: budgets budgets_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4832 (class 2606 OID 35349)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4833 (class 2606 OID 35310)
-- Name: categories categories_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4838 (class 2606 OID 35344)
-- Name: financial_goals financial_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT financial_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4840 (class 2606 OID 35461)
-- Name: partners partners_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4839 (class 2606 OID 35363)
-- Name: projects projects_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4834 (class 2606 OID 35331)
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 4835 (class 2606 OID 35368)
-- Name: transactions transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- TOC entry 4836 (class 2606 OID 36827)
-- Name: transactions transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE SET NULL;


--
-- TOC entry 4837 (class 2606 OID 35326)
-- Name: transactions transactions_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 36822)
-- Name: wallets wallets_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4831 (class 2606 OID 35297)
-- Name: workspaces workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-02 12:38:25

--
-- PostgreSQL database dump complete
--

