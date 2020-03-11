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
    code integer NOT NULL,
    destination integer DEFAULT 0,
    address integer DEFAULT 0,
    item_name character varying(128) DEFAULT 0 NOT NULL
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
    operation_code integer
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
    age integer,
    failed_logins integer DEFAULT 0 NOT NULL,
    token character varying(128)
);


ALTER TABLE public.users OWNER TO autostorage;

--
-- Data for Name: liabilities; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.liabilities (user_id, type, value, state, id, date, item_name) FROM stdin;
4	storageunit	$72.00	not_paid	18	1583515173067	\N
4	import	$4.00	not_paid	19	1583515275814	\N
4	storageunit	$0.00	not_paid	20	1583515344841	\N
4	storageunit	$1.00	not_paid	21	1583515443353	\N
4	export	$4.15	not_paid	22	1583515509415	\N
4	import	$4.98	not_paid	23	1583516647608	\N
4	export	$4.98	not_paid	24	1583516667255	\N
4	import	$4.98	not_paid	25	1583519735351	\N
4	export	$4.98	not_paid	26	1583521118431	\N
4	export	$4.98	not_paid	28	1583597365191	\N
4	export	$4.98	not_paid	29	1583597492946	\N
13	import	$4.98	not_paid	30	1583601018076	\N
13	storageunit	$1.00	not_paid	31	1583601046869	\N
13	export	$4.98	not_paid	32	1583837013171	\N
13	storageunit	$197.00	not_paid	33	1583837033098	\N
13	storageunit	$0.00	not_paid	34	1583837055764	\N
13	import	$4.98	not_paid	35	1583837391097	\N
13	export	$4.98	not_paid	36	1583837470064	\N
4	storageunit	$389.00	not_paid	37	1583872980627	\N
4	storageunit	$0.00	not_paid	38	1583873019353	\N
4	storageunit	$748.00	not_paid	39	1583873054430	\N
4	storageunit	$0.00	not_paid	40	1583873082089	\N
4	import	$4.98	not_paid	41	1583873146244	\N
4	export	$4.98	not_paid	42	1583873207259	\N
4	import	$4.98	not_paid	43	1583874262363	\N
4	export	$4.98	not_paid	44	1583874350490	\N
4	import	$4.98	not_paid	45	1583874446866	\N
4	export	$4.98	not_paid	46	1583874480345	\N
4	storageunit	$390.00	not_paid	47	1583874754838	\N
4	storageunit	$390.00	not_paid	48	1583874756469	\N
4	storageunit	$1,620.00	not_paid	49	1583874758256	\N
4	storageunit	$1.00	not_paid	50	1583874760128	\N
4	storageunit	$1.00	not_paid	51	1583874762050	\N
4	storageunit	$1,620.00	not_paid	52	1583874767002	\N
4	storageunit	$466.00	not_paid	53	1583874768995	\N
4	import	$4.98	not_paid	54	1583875153147	\N
4	export	$4.98	not_paid	55	1583875180139	\N
4	export	$4.98	not_paid	56	1583875245620	\N
4	import	$4.98	not_paid	57	1583875710392	my stock #32472345
4	export	$4.98	not_paid	58	1583875798026	my stock #32472345
4	import	$4.98	not_paid	59	1583875889031	my special stock #32546543
4	import	$4.98	not_paid	60	1583919830371	my stock #34565
\.


--
-- Name: liabilities_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.liabilities_id', 60, true);


--
-- Name: operation_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.operation_id', 62, true);


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.operations (id, type, status, time_added, code, destination, address, item_name) FROM stdin;
54	export	complete	1583874333068	804021	0	12	asdasd
55	import	complete	1583874436540	762994	12	0	new asdasd
56	export	complete	1583874467405	960953	0	12	new asdasd
57	import	complete	1583875142348	922293	10	0	my stock #235722
58	export	complete	1583875169936	438578	0	10	my stock #235722
59	import	complete	1583875701145	933657	10	0	my stock #32472345
60	export	complete	1583875784562	434560	0	10	my stock #32472345
61	import	complete	1583875879167	565638	10	0	my special stock #32546543
62	import	complete	1583919569437	324695	1010	0	my stock #5645766
53	import	complete	1583874247335	314458	12	0	asdasd
\.


--
-- Data for Name: storageunits; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.storageunits (address, owner_id, name, time_purchased, description, status, operation_code) FROM stdin;
2002	-1	storage unit	0	this is a new empty storage unit	vacant	\N
1	-1	storage unit	0	this is a new empty storage unit	vacant	\N
10	4	my special stock #32546543	1583874812245	20 fire extinguishers class A	occupied	\N
9	13	box	1583837325113	time's relative	vacant	\N
2222	0	slot 2	\N	this is a slot	vacant	\N
1010	4	my stock #34565	1583874812245	\N	occupied	\N
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
1050	4	storage unit	1583874812245	this is a new empty storage unit	vacant	\N
\.


--
-- Name: user_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.user_id', 13, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.users (id, first_name, last_name, username, password, email, age, failed_logins, token) FROM stdin;
2	Georgi	bald	asdfghj	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	gbaldjiev20204@gmail.com	\N	0	\N
13	John	Smith	JohnSmith	ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f	smith@gmail.com	\N	0	MMPUpUH8u4ThMuaDdUJxlzYlzjmU9zGyfRBIsKCxihQduMmSvMbZvZ5xNNPyljcF
3	Georgi	baldjie	asdasdasd	8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414	gbaldjiev200s4@gmail.com	\N	0	\N
1	George	Baldjiev	ssznakabulgarian	$2b$10$.nHjtpNhu6imxIRoBZBuPOLJbSC5Cv628FL7bu5QnJr8KmqqYS5ou	gbaldjiev2004@gmail.com	15	3	\N
4	Georgi	asd	asdasd	688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6	gbaldjiev20a04@gmail.com	\N	0	QquUOHfCJTslZFWfBuB3naxwhWzcl2yZCyKaZ4OUuCNO5jZlmJ7RhliYtziJFNme
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

