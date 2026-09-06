# KrishiSetu — Smart Farmer Procurement & Queue Management System

A full-stack system that digitizes the farmer procurement process at agricultural
collection centres — replacing informal, first-come-first-served queues with a
transparent, token-based system that farmers, staff, and administrators can all see
in real time.

## Problem

At agricultural procurement centres (mandis), farmers often wait in long, disorganized
queues with no visibility into wait times or fair ordering. Staff have no digital record
of transactions, and administrators lack any structured way to manage centres, crop
pricing, or procurement volume.

## What it does

- **Farmers** register, generate a queue token for a specific centre and crop, and
  track their position in real time.
- **Staff** call the next farmer in line, record the procurement (quantity, quality
  grade, price), and the system computes the total automatically.
- **Admins** manage procurement centres and crop types (including MSP vs market price).
- A **public Live Queue Board** displays real-time queue status — designed to run on a
  screen at the physical centre.

## Architecture

Frontend (React / TanStack) <---- REST + JWT ----> Backend (Spring Boot) <----> PostgreSQL


## Tech stack

**Backend**
- Java 21, Spring Boot 4.1
- Spring Security + JWT (role-based access: Farmer / Staff / Admin)
- Spring Data JPA + Hibernate
- PostgreSQL

**Frontend**
- React 19, TypeScript
- TanStack Start / TanStack Router, TanStack Query
- Tailwind CSS, shadcn/ui components
- Bun (package manager/runtime)

## Key features

- Role-based authentication and authorization (JWT)
- Token generation and live queue state machine (Waiting → Called → In Progress → Completed)
- Automatic procurement total calculation
- Real-time queue polling for the public display board
- Admin-managed reference data (centres, crop types, MSP pricing)

## Project structure

harvest-ledger/
├── frontend/ — React/TanStack web app
├── backend/ — Spring Boot REST API
└── SETUP.md — full setup & run instructions


## Getting started

See [SETUP.md](./SETUP.md) for complete installation and run instructions,
including PostgreSQL setup and troubleshooting common port/connection errors.