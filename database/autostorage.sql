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
-- Name: failed_login(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.failed_login(a integer) RETURNS void
    LANGUAGE sql
    AS $$
UPDATE users SET failed_logins=(SELECT failed_logins FROM users WHERE id=a)+1 WHERE id=a
$$;


ALTER FUNCTION public.failed_login(a integer) OWNER TO postgres;

--
-- Name: has_too_many_failed_logins(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_too_many_failed_logins(a integer) RETURNS boolean
    LANGUAGE sql
    AS $$
SELECT (failed_logins > 10) FROM users WHERE id=a
$$;


ALTER FUNCTION public.has_too_many_failed_logins(a integer) OWNER TO postgres;

--
-- Name: reset_failed_logins(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_failed_logins(a integer) RETURNS void
    LANGUAGE sql
    AS $$
UPDATE users SET failed_logins=0 WHERE id=a
$$;


ALTER FUNCTION public.reset_failed_logins(a integer) OWNER TO postgres;

--
-- Name: liabilities_id; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.liabilities_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.liabilities_id OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: liabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.liabilities (
    user_id integer NOT NULL,
    type character varying(64) NOT NULL,
    value money NOT NULL,
    state character varying(64) NOT NULL,
    id integer DEFAULT nextval('public.liabilities_id'::regclass) NOT NULL,
    date bigint
);


ALTER TABLE public.liabilities OWNER TO postgres;

--
-- Name: operation_id; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operation_id OWNER TO postgres;

--
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id integer DEFAULT nextval('public.operation_id'::regclass) NOT NULL,
    type character varying(64) NOT NULL,
    status character varying(64) DEFAULT 'waiting'::character varying NOT NULL,
    time_added bigint NOT NULL,
    code integer NOT NULL,
    destination integer DEFAULT 0,
    address integer DEFAULT 0,
    item_name character varying(128) DEFAULT 0 NOT NULL
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- Name: storageunits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storageunits (
    address integer NOT NULL,
    owner_id integer,
    name character varying(128),
    time_purchased bigint,
    description character varying(256),
    status character varying(32) DEFAULT 'vacant'::character varying NOT NULL,
    operation_code integer
);


ALTER TABLE public.storageunits OWNER TO postgres;

--
-- Name: user_id; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer DEFAULT nextval('public.user_id'::regclass) NOT NULL,
    first_name character varying(128) NOT NULL,
    last_name character varying(128) NOT NULL,
    username character varying(128) NOT NULL,
    password character varying(256) NOT NULL,
    email character varying(128) NOT NULL,
    age integer,
    failed_logins integer DEFAULT 0 NOT NULL,
    token character varying(128)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: liabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.liabilities (user_id, type, value, state, id, date) FROM stdin;
4	storageunit	$72.00	not_paid	18	1583515173067
4	import	$4.00	not_paid	19	1583515275814
4	storageunit	$0.00	not_paid	20	1583515344841
4	storageunit	$1.00	not_paid	21	1583515443353
4	export	$4.15	not_paid	22	1583515509415
4	import	$4.98	not_paid	23	1583516647608
4	export	$4.98	not_paid	24	1583516667255
4	import	$4.98	not_paid	25	1583519735351
4	export	$4.98	not_paid	26	1583521118431
4	export	$4.98	not_paid	28	1583597365191
4	export	$4.98	not_paid	29	1583597492946
13	import	$4.98	not_paid	30	1583601018076
13	storageunit	$1.00	not_paid	31	1583601046869
13	export	$4.98	not_paid	32	1583837013171
13	storageunit	$197.00	not_paid	33	1583837033098
13	storageunit	$0.00	not_paid	34	1583837055764
13	import	$4.98	not_paid	35	1583837391097
13	export	$4.98	not_paid	36	1583837470064
\.


--
-- Name: liabilities_id; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.liabilities_id', 36, true);


--
-- Name: operation_id; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_id', 50, true);


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, type, status, time_added, code, destination, address, item_name) FROM stdin;
42	import	complete	1583516640284	110419	12	0	0
18	export	complete	1583327163909	440453	0	1030	0
19	import	waiting	1583406754524	992031	1030	0	0
20	import	complete	1583406865207	388101	1030	0	0
21	export	complete	1583406915656	367116	0	1030	0
43	export	complete	1583516658982	952090	0	12	0
22	import	complete	1583407097580	620382	4	0	0
23	export	complete	1583407163058	913593	0	4	0
24	import	complete	1583411557165	126836	1040	0	0
44	import	complete	1583519724701	849458	1050	0	0
25	import	complete	1583412473942	803730	6	0	0
26	import	complete	1583426922227	552666	2	0	0
29	import	complete	1583428168552	432946	12	0	0
45	export	complete	1583521101151	566474	0	1050	0
30	import	complete	1583428175535	996884	1050	0	0
31	export	complete	1583428215602	385706	0	1050	0
32	export	complete	1583485542542	596185	0	12	0
33	import	complete	1583485590386	948182	1020	0	0
27	export	complete	1583427104059	688056	0	2	0
34	import	complete	1583489754165	319161	2002	0	0
28	export	complete	1583427755838	531020	0	1040	0
36	import	complete	1583491945030	160654	2002	0	0
35	import	complete	1583490322491	249459	2002	0	0
37	import	complete	1583492165325	341105	2002	0	0
38	export	error	1583492347963	759675	0	2002	0
39	export	complete	1583492658329	593658	0	2002	0
1	export	complete	1583492165328	123456	1111	0	0
40	import	complete	1583505093302	523422	12	0	0
46	export	complete	1583597481363	959609	0	1111	0
41	export	complete	1583515499989	580859	0	12	0
47	import	complete	1583600871238	737357	9	0	0
48	export	complete	1583836990849	346353	0	9	0
49	import	complete	1583837345391	107455	9	0	0
50	export	complete	1583837458655	536237	0	9	0
\.


--
-- Data for Name: storageunits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storageunits (address, owner_id, name, time_purchased, description, status, operation_code) FROM stdin;
10	-1	slot	1583837043278	this is a new empty slot	vacant	\N
9	13	box	1583837325113	time's relative	vacant	\N
2222	0	slot 2	\N	this is a slot	vacant	\N
2002	4	bgjghkj	1581924028985	vnvmnbm	vacant	\N
3333	0	slot 3	\N	this is a slot	procesing	\N
3	11	slot	1583407079545	this is a new empty slot	vacant	\N
1030	4	asdasdasd	1581924028985	dsadsadsa	vacant	\N
4	11	Gahahs	1583407079545	Hshsggahd	vacant	\N
5	11	slot	1583407356430	this is a new empty slot	vacant	\N
12	4	asdasd	1583405043279	asdasdasd	vacant	\N
1050	4	123654789	1583405043279	khgfredujk	vacant	\N
1010	4	imported item #1	1583405043279	description	vacant	\N
11	-1	slot	1583405043279	this is a new empty slot	vacant	\N
1111	4	stoka	1583313862582	test description	vacant	\N
7	12	slot	1583426969388	this is a new empty slot	vacant	\N
8	12	slot	1583426971751	this is a new empty slot	vacant	\N
2	12	test	1583426883923	test	vacant	\N
6	7	Agshhssh	1583412436077	Jdhdhdhs	occupied	\N
1	-1	slot	1583405636706	this is a new empty slot	vacant	\N
1040	4	asdasd	1582972471310	asdasdasd	vacant	\N
\.


--
-- Name: user_id; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id', 13, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, username, password, email, age, failed_logins, token) FROM stdin;
2	Georgi	bald	asdfghj	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	gbaldjiev20204@gmail.com	\N	0	\N
13	John	Smith	JohnSmith	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	smith@gmail.com	\N	0	MMPUpUH8u4ThMuaDdUJxlzYlzjmU9zGyfRBIsKCxihQduMmSvMbZvZ5xNNPyljcF
3	Georgi	baldjie	asdasdasd	8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414	gbaldjiev200s4@gmail.com	\N	0	\N
1	George	Baldjiev	ssznakabulgarian	$2b$10$.nHjtpNhu6imxIRoBZBuPOLJbSC5Cv628FL7bu5QnJr8KmqqYS5ou	gbaldjiev2004@gmail.com	15	3	\N
4	Georgi	asd	asdasd	688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6	gbaldjiev20a04@gmail.com	\N	0	5D85rsY9FfaeboNg9UyRkhqdSVue59hvES5R1tImZ031hrMKrNbJbOVDdi5XYhrW
6	Georgi	Baldjiev	myPhone	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	gbaldjiev20040@gmail.com	\N	0	\N
5	Georgi	Baldjiev2	ssznakabg3	5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8	gbaldjiev2000@gmail.com	\N	0	TTqEeaiE3xOHw3vppE5xZucCBnac1aiAxz6GCdY8oPW1ZettsHSEv5O6kEimgxix
8	asdasdsdasd	asdasdasdasdasd	asdasdasdasd	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	asdasdasdasd@gmail.com	\N	0	2eKTGgrvqSwRBhoECB8l9MzLn3pnxFXGztQz5MdVmg6v7DvllCLHXDTsrFbf4ke4
9	mynameisname	lastname	thisismyname	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	asd@gmail.com	\N	0	\N
10	1234	1234	qwerty	65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5	qwert@gmail.com	\N	0	0lRXITpxPpo0fhXbMkDsrn7fgWiccmhl8QYN9xMDA9J9Qwyj4XJlvHS4pCZQCU9Z
11	Asdfgg	Asdfgh	Asdfgh	8588310a98676af6e22563c1559e1ae20f85950792bdcd0c8f334867c54581cd	asdfgh@gmail.com	\N	0	\N
7	test	test	test	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	test@test123.com	\N	0	xzglHJvok36lRH4RaF3amv0Bdmx9vksv224JPkz62WCXkZDNlvdeo2JjeBomsnh7
12	test2	test2	test2	a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3	test2@test2.com	\N	0	\N
\.


--
-- Name: storageunits address_PK; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storageunits
    ADD CONSTRAINT "address_PK" PRIMARY KEY (address);


--
-- Name: operations id_PK; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT "id_PK" PRIMARY KEY (id);


--
-- Name: liabilities liabilities_id_PK; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.liabilities
    ADD CONSTRAINT "liabilities_id_PK" PRIMARY KEY (id);


--
-- Name: users user_PK; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "user_PK" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

