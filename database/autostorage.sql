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
    MINVALUE 0
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
    address character varying(256),
    profile_picture character varying(100000) DEFAULT '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'::character varying
);


ALTER TABLE public.users OWNER TO autostorage;

--
-- Data for Name: liabilities; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.liabilities (user_id, type, value, state, id, date, item_name) FROM stdin;
\.


--
-- Name: liabilities_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.liabilities_id', 0, true);


--
-- Name: operation_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.operation_id', 0, true);


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.operations (id, type, status, time_added, code, destination, address, item_name, owner_id) FROM stdin;
\.


--
-- Data for Name: storageunits; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.storageunits (address, owner_id, name, time_purchased, description, status, operation_code) FROM stdin;
1000	-1	storage unit	\N	this is an empty storage unit	vacant	\N
1001	-1	storage unit	\N	this is an empty storage unit	vacant	\N
1002	-1	storage unit	\N	this is an empty storage unit	vacant	\N
2000	-1	storage unit	\N	this is an empty storage unit	vacant	\N
2001	-1	storage unit	\N	this is an empty storage unit	vacant	\N
2002	-1	storage unit	\N	this is an empty storage unit	vacant	\N
\.


--
-- Name: user_id; Type: SEQUENCE SET; Schema: public; Owner: autostorage
--

SELECT pg_catalog.setval('public.user_id', 0, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: autostorage
--

COPY public.users (id, first_name, last_name, username, password, email, failed_logins, token, address, profile_picture) FROM stdin;
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

