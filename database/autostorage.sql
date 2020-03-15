--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.16
-- Dumped by pg_dump version 9.6.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: failed_login(integer); Type: FUNCTION; Schema: public; Owner: autostorage
--

CREATE FUNCTION public.failed_login(a integer) RETURNS void
    LANGUAGE sql
    AS $$
UPDATE users SET failed_logins=(SELECT failed_logins FROM users WHERE id=a)+1 WHERE id=a
$$;


ALTER FUNCTION public.failed_login(a integer) OWNER TO autostorage;

--
-- Name: has_too_many_failed_logins(integer); Type: FUNCTION; Schema: public; Owner: autostorage
--

CREATE FUNCTION public.has_too_many_failed_logins(a integer) RETURNS boolean
    LANGUAGE sql
    AS $$
SELECT (failed_logins > 10) FROM users WHERE id=a
$$;


ALTER FUNCTION public.has_too_many_failed_logins(a integer) OWNER TO autostorage;

--
-- Name: reset_failed_logins(integer); Type: FUNCTION; Schema: public; Owner: autostorage
--

CREATE FUNCTION public.reset_failed_logins(a integer) RETURNS void
    LANGUAGE sql
    AS $$
UPDATE users SET failed_logins=0 WHERE id=a
$$;


ALTER FUNCTION public.reset_failed_logins(a integer) OWNER TO autostorage;

--
-- Name: liabilities_id; Type: SEQUENCE; Schema: public; Owner: autostorage
--

CREATE SEQUENCE public.liabilities_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.liabilities_id OWNER TO autostorage;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: liabilities; Type: TABLE; Schema: public; Owner: autostorage
--

CREATE TABLE public.liabilities (
    user_id integer NOT NULL,
    type character varying(64) NOT NULL,
    value money NOT NULL,
    state character varying(64) NOT NULL,
    id integer DEFAULT nextval('public.liabilities_id'::regclass) NOT NULL,
    date bigint,
    item_name character varying(128)
);


ALTER TABLE public.liabilities OWNER TO autostorage;

--
-- Name: operation_id; Type: SEQUENCE; Schema: public; Owner: autostorage
--

CREATE SEQUENCE public.operation_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operation_id OWNER TO autostorage;

--
-- Name: operations; Type: TABLE; Schema: public; Owner: autostorage
--

CREATE TABLE public.operations (
    id integer DEFAULT nextval('public.operation_id'::regclass) NOT NULL,
    type character varying(64) NOT NULL,
    status character varying(64) DEFAULT 'waiting'::character varying NOT NULL,
    time_added bigint NOT NULL,
    code numeric NOT NULL,
    destination integer DEFAULT 0,
    address integer DEFAULT 0,
    item_name character varying(128) DEFAULT 0 NOT NULL,
    owner_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.operations OWNER TO autostorage;

--
-- Name: storageunits; Type: TABLE; Schema: public; Owner: autostorage
--

CREATE TABLE public.storageunits (
    address integer NOT NULL,
    owner_id integer,
    name character varying(128),
    time_purchased bigint,
    description character varying(256),
    status character varying(32) DEFAULT 'vacant'::character varying NOT NULL,
    operation_code numeric
);


ALTER TABLE public.storageunits OWNER TO autostorage;

--
-- Name: user_id; Type: SEQUENCE; Schema: public; Owner: autostorage
--

CREATE SEQUENCE public.user_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id OWNER TO autostorage;

--
-- Name: users; Type: TABLE; Schema: public; Owner: autostorage
--

CREATE TABLE public.users (
    id integer DEFAULT nextval('public.user_id'::regclass) NOT NULL,
    first_name character varying(128) NOT NULL,
    last_name character varying(128) NOT NULL,
    username character varying(128) NOT NULL,
    password character varying(256) NOT NULL,
    email character varying(128) NOT NULL,
    failed_logins integer DEFAULT 0 NOT NULL,
    token character varying(128),
    address character varying(256)
);


ALTER TABLE public.users OWNER TO autostorage;

--
-- Data for Name: liabilities; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.liabilities (user_id, type, value, state, id, date, item_name) FROM stdin;
4	storageunit	$1,620.00	not_paid	1	1583874758256	hhff
4	import	$4.98	not_paid	2	1583875710392	my stock #32472345
4	export	$4.98	not_paid	3	1583875798026	my stock #32472345
4	import	$4.98	not_paid	4	1583875889031	my special stock #32546543
4	import	$4.98	not_paid	5	1583919830371	my stock #34565
4	export	$4.98	not_paid	8	1584033135934	my stock #34565
4	import	$4.98	not_paid	9	1584035286045	asasdasd
4	export	$4.98	not_paid	10	1584035299338	asasdasd
4	import	$4.98	not_paid	11	1584037852375	namename
4	export	$4.98	not_paid	12	1584037871965	namename
4	released storage unit	$137.00	not_paid	13	1584039611975	\N
\.


--
-- Name: liabilities_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.liabilities_id', 13, true);


--
-- Name: operation_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.operation_id', 84, true);


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.operations (id, type, status, time_added, code, destination, address, item_name, owner_id) FROM stdin;
54	export	complete	1583874333068	804021	0	12	asdasd	0
55	import	complete	1583874436540	762994	12	0	new asdasd	0
56	export	complete	1583874467405	960953	0	12	new asdasd	0
57	import	complete	1583875142348	922293	10	0	my stock #235722	0
58	export	complete	1583875169936	438578	0	10	my stock #235722	0
59	import	complete	1583875701145	933657	10	0	my stock #32472345	0
60	export	complete	1583875784562	434560	0	10	my stock #32472345	0
61	import	complete	1583875879167	565638	10	0	my special stock #32546543	0
62	import	complete	1583919569437	324695	1010	0	my stock #5645766	0
53	import	complete	1583874247335	314458	12	0	asdasd	0
63	export	complete	1584033099672	200826	0	1010	my stock #34565	4
64	import	complete	1584035275993	1243	1050	0	asasdasd	4
65	export	complete	1584035289635	595381	0	1050	asasdasd	4
66	import	complete	1584037833191	8273637838362621	1010	0	namename	4
67	export	complete	1584037863956	288818	0	1010	namename	4
69	import	canceled	1584206551024	23552	1010	0	my stock #23552	4
68	export	canceled	1584197519436	309326	0	10	my special stock #32546543	4
70	export	canceled	1584208679739	213548	0	10	my special stock #32546543	4
72	import	canceled	1584208895635	24655	2002	0	dfghdfg	4
71	import	canceled	1584208878018	24655	1010	0	namename	4
73	import	canceled	1584209139491	12345	1010	0	asdasd	4
74	import	canceled	1584209170556	12345	2002	0	asdasdadsadadasad	4
75	import	canceled	1584209244446	12345	1010	0	namename	4
76	import	canceled	1584209255206	12345	2002	0	asdasd	4
78	import	canceled	1584210091163	1234	2002	0	qqwrq	4
77	import	canceled	1584210070130	1234	1010	0	asdsdas	4
79	import	canceled	1584210138829	1234	1010	0	asasdas	4
80	import	canceled	1584210159302	1234	2002	0	asdadsdsdddd	4
81	import	canceled	1584210361341	1234	1010	0	namename	4
82	import	canceled	1584210373399	1234	2002	0	assdasd	4
83	import	canceled	1584210748663	1234	1010	0	asdasd	4
84	import	canceled	1584210786478	1234	2002	0	asdas	4
\.


--
-- Data for Name: storageunits; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.storageunits (address, owner_id, name, time_purchased, description, status, operation_code) FROM stdin;
9	13	box	1583837325113	time's relative	vacant	\N
2222	0	slot 2	\N	this is a slot	vacant	\N
3333	0	slot 3	\N	this is a slot	procesing	\N
3	11	slot	1583407079545	this is a new empty slot	vacant	\N
4	11	Gahahs	1583407079545	Hshsggahd	vacant	\N
5	11	slot	1583407356430	this is a new empty slot	vacant	\N
11	-1	slot	1583405043279	this is a new empty storage unit	vacant	\N
12	-1	storage unit	0	this is a new empty storage unit	vacant	\N
1030	-1	storage unit	0	this is a new empty storage unit	vacant	\N
1040	-1	storage unit	0	this is a new empty storage unit	vacant	\N
1111	-1	storage unit	0	this is a new empty storage unit	vacant	\N
7	12	slot	1583426969388	this is a new empty slot	vacant	\N
8	12	slot	1583426971751	this is a new empty slot	vacant	\N
2	12	test	1583426883923	test	vacant	\N
6	7	Agshhssh	1583412436077	Jdhdhdhs	occupied	\N
1050	-1	storage unit	0	this is a description	vacant	\N
10	4	my special stock #32546543	1583874812245	20 fire extinguishers class A	occupied	\N
1010	4	storage unit	1583874812245	this is a description	vacant	\N
2002	4	storage unit	1584037900094	this is a description	vacant	\N
1	4	storage unit	1584306007405	this is a new empty storage unit	vacant	\N
\.


--
-- Name: user_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.user_id', 13, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.users (id, first_name, last_name, username, password, email, failed_logins, token, address) FROM stdin;
2	Georgi	bald	asdfghj	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	gbaldjiev20204@gmail.com	0	\N	\N
13	John	Smith	JohnSmith	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	smith@gmail.com	0	MMPUpUH8u4ThMuaDdUJxlzYlzjmU9zGyfRBIsKCxihQduMmSvMbZvZ5xNNPyljcF	\N
3	Georgi	baldjie	asdasdasd	8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414	gbaldjiev200s4@gmail.com	0	\N	\N
1	George	Baldjiev	ssznakabulgarian	$2b$10$.nHjtpNhu6imxIRoBZBuPOLJbSC5Cv628FL7bu5QnJr8KmqqYS5ou	gbaldjiev2004@gmail.com	3	\N	\N
6	Georgi	Baldjiev	myPhone	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	gbaldjiev20040@gmail.com	0	\N	\N
5	Georgi	Baldjiev2	ssznakabg3	5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8	gbaldjiev2000@gmail.com	0	TTqEeaiE3xOHw3vppE5xZucCBnac1aiAxz6GCdY8oPW1ZettsHSEv5O6kEimgxix	\N
8	asdasdsdasd	asdasdasdasdasd	asdasdasdasd	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	asdasdasdasd@gmail.com	0	2eKTGgrvqSwRBhoECB8l9MzLn3pnxFXGztQz5MdVmg6v7DvllCLHXDTsrFbf4ke4	\N
9	mynameisname	lastname	thisismyname	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	asd@gmail.com	0	\N	\N
10	1234	1234	qwerty	65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5	qwert@gmail.com	0	0lRXITpxPpo0fhXbMkDsrn7fgWiccmhl8QYN9xMDA9J9Qwyj4XJlvHS4pCZQCU9Z	\N
4	Georgi	asd	asdasd	688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6	gbaldjiev20a04@gmail.com	0	f2uddIOQFOc3P184XiCPo00EneOboqotVnTPMxr4O8KjyMwGqtZOB8Cks3xtjgYe	\N
11	Asdfgg	Asdfgh	Asdfgh	8588310a98676af6e22563c1559e1ae20f85950792bdcd0c8f334867c54581cd	asdfgh@gmail.com	0	\N	\N
7	test	test	test	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	test@test123.com	0	xzglHJvok36lRH4RaF3amv0Bdmx9vksv224JPkz62WCXkZDNlvdeo2JjeBomsnh7	\N
12	test2	test2	test2	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	test2@test2.com	0	\N	\N
\.


--
-- Name: storageunits address_PK; Type: CONSTRAINT; Schema: public; Owner: autostorage
--

ALTER TABLE ONLY public.storageunits
    ADD CONSTRAINT "address_PK" PRIMARY KEY (address);


--
-- Name: operations id_PK; Type: CONSTRAINT; Schema: public; Owner: autostorage
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT "id_PK" PRIMARY KEY (id);


--
-- Name: liabilities liabilities_id_PK; Type: CONSTRAINT; Schema: public; Owner: autostorage
--

ALTER TABLE ONLY public.liabilities
    ADD CONSTRAINT "liabilities_id_PK" PRIMARY KEY (id);


--
-- Name: users user_PK; Type: CONSTRAINT; Schema: public; Owner: autostorage
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "user_PK" PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: autostorage
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO autostorage;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

