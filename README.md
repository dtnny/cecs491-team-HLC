# GambLogic

A web application built with Next.js and Supabase to help users track gambling wins and losses, generate tax reports, and maximize deductions responsibly.

- [Gambling Awareness App](#gambling-awareness-app)
  * [Synopsis](#synopsis)
  * [Motivation](#motivation)
  * [Features](#features)
  * [Getting Started & Installing Required Software](#getting-started-and-installing-required-software)
    + [Prerequisites](#prerequisites)
    + [Installation](#installation)
    + [Running the Application](#running-the-application)
    + [Running with Visual Studio Code](#running-with-visual-studio-code)
  * [Operational Flow](#operational-flow)
  * [Supported Functionality](#supported-functionality)
  * [Built With](#built-with)
  * [Limitations](#limitations)
  * [Future Improvements](#future-improvements)
  * [Authors](#authors)
  * [Acknowledgments](#acknowledgments)
  * [Screenshots](#screenshots)

## Synopsis

The Gambling Awareness App is a full-stack web application designed to simplify the process of tracking gambling activities for tax purposes. Built with **Next.js** for the frontend, **Supabase** for authentication and data storage, it allows users to log gambling wins and losses, generate tax reports, and manage their accounts securely. The application provides an intuitive interface for users to claim deductions by documenting their gambling sessions accurately, ensuring compliance with tax regulations.

## Motivation

This project was developed to address the complexity of tracking gambling-related financial data for tax filings. Many individuals struggle to maintain accurate records of their gambling wins and losses, which can lead to missed deductions or tax inaccuracies. The Gambling Awareness App aims to empower users with a user-friendly tool to manage their gambling activities responsibly, making tax season less stressful and helping them maximize legitimate deductions.

## Features

- **User Authentication**: Secure sign-up and sign-in using Supabase Authentication with email and password.
- **Gambling Diary**: Log gambling sessions, including wins, losses, and supporting documents (planned feature).
- **Tax Report Generation**: Create organized reports for tax deductions (stubbed feature).
- **Dashboard**: Personalized hub with quick access to key actions like filing losses or checking rewards.
- **Responsive UI**: Clean interface built with Tailwind CSS, optimized for desktop. Has persistent navigation with an account dropdown for signed-in users.
- **Secure Data Handling**: Uses Supabase’s encryption for user data and complies with privacy standards.

## Getting Started & Installing Required Software

These instructions will help you set up and run the project on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher): [Download Node.js](https://nodejs.org/en/download/)
- **Git**: [Download Git](https://git-scm.com/downloads)
- **Visual Studio Code** : [Download VS Code](https://code.visualstudio.com/download)
- A **Supabase** account (mainly for devs): [Sign up at Supabase](https://supabase.com/)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/dtnny/gambling-awareness-app.git
   cd gambling-awareness-app/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Supabase Environment Variables**:
   - Create a `.env.local` file in the `frontend` directory:
     ```bash
     touch .env.local
     ```
   - Add your Supabase project details (found in Supabase Dashboard > Settings > API):
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Ensure `.env.local` is Ignored**:
   - Verify `.env.local` is in `.gitignore` to prevent committing sensitive data:
     ```
     .env.local
     ```

### Running the Application

- **Start the Development Server**:
   ```bash
   cd gambling-awareness-app/frontend
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.


## Authors

- **Vincent Pierlot** - [NobleB312](https://github.com/NobleB312)
- **Ronald Nguyen** - [RonaldTri](https://github.com/RonaldTri)
- **Cristian Almazan** - [Cristron123](https://github.com/Cristron123)
- **Sroth Sinha** - [SrothCS](https://github.com/SrothCS)
- **Phuc Phan** - [gphucc.phan](https://github.com/gphucc.phan)
- **Daniel Magdaleno Gonzalez** - [dtnny](https://github.com/dtnny)

## Acknowledgments

- **Supabase Documentation**: For guiding authentication and database setup.
- **Next.js Documentation**: For App Router and Tailwind integration.
- **Tailwind CSS**: For rapid, responsive styling.
