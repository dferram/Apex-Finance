--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-03-02 17:20:25

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
-- TOC entry 4965 (class 0 OID 0)
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
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 225
-- Name: financial_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.financial_goals_id_seq OWNED BY public.financial_goals.id;


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
-- TOC entry 4967 (class 0 OID 0)
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
    project_id bigint
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
-- TOC entry 4968 (class 0 OID 0)
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
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


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
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 219
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ferram
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- TOC entry 4772 (class 2604 OID 35306)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 35340)
-- Name: financial_goals id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals ALTER COLUMN id SET DEFAULT nextval('public.financial_goals_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 35358)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 35319)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4767 (class 2604 OID 35282)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 35292)
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- TOC entry 4953 (class 0 OID 35303)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.categories (id, workspace_id, name, monthly_budget, parent_id, is_project) FROM stdin;
1	1	Comida/Cafetería	0.00	\N	f
2	2	Software/SaaS	0.00	\N	f
3	2	RazoConnect	0.00	2	f
4	2	Azure	0.00	3	f
5	2	Azure App service	0.00	4	f
8	2	Bandwidth	0.00	4	f
7	2	Redis Cache	0.00	4	f
9	2	Claude Credits	0.00	3	f
10	2	Azure DB Postgres	0.00	4	f
\.


--
-- TOC entry 4957 (class 0 OID 35337)
-- Dependencies: 226
-- Data for Name: financial_goals; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.financial_goals (id, user_id, name, target_amount, current_amount, deadline) FROM stdin;
1	1	First 100k 	100000.00	0.00	\N
\.


--
-- TOC entry 4959 (class 0 OID 35355)
-- Dependencies: 228
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.projects (id, workspace_id, name, description) FROM stdin;
\.


--
-- TOC entry 4955 (class 0 OID 35316)
-- Dependencies: 224
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.transactions (id, workspace_id, category_id, amount, description, is_essential, date, project_id) FROM stdin;
\.


--
-- TOC entry 4949 (class 0 OID 35279)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.users (id, name, email, created_at) FROM stdin;
1	Founder	dferramm@gmail.com	2026-02-27 22:56:13.888352
\.


--
-- TOC entry 4951 (class 0 OID 35289)
-- Dependencies: 220
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: ferram
--

COPY public.workspaces (id, user_id, name, is_professional, currency) FROM stdin;
1	1	Personal	f	MXN
2	1	xCore (Startup)	t	MXN
\.


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.categories_id_seq', 13, true);


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 225
-- Name: financial_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.financial_goals_id_seq', 1, true);


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 227
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 223
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.transactions_id_seq', 4, true);


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 219
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ferram
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 2, true);


--
-- TOC entry 4788 (class 2606 OID 35309)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 35343)
-- Name: financial_goals financial_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT financial_goals_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 35362)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 35325)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 35287)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4784 (class 2606 OID 35285)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 35296)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 35349)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4797 (class 2606 OID 35310)
-- Name: categories categories_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4801 (class 2606 OID 35344)
-- Name: financial_goals financial_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT financial_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4802 (class 2606 OID 35363)
-- Name: projects projects_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4798 (class 2606 OID 35331)
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 4799 (class 2606 OID 35368)
-- Name: transactions transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- TOC entry 4800 (class 2606 OID 35326)
-- Name: transactions transactions_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 35297)
-- Name: workspaces workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ferram
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-03-02 17:20:26

--
-- PostgreSQL database dump complete
--

