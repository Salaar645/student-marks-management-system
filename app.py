from flask import Flask, render_template, request, redirect, url_for, session
import mysql.connector
import os

app = Flask(__name__)
app.secret_key = "your_secret_key"

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="teacher_db"
    )

# Login Page
@app.route("/")
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM teachers WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            session["user"] = user["email"]
            return redirect(url_for("sub_page"))  # Redirect to sub1.html
        else:
            return "Invalid credentials! <a href='/register'>Register here</a>"

    return render_template("login1.html")

# Registration Page
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the email already exists
        cursor.execute("SELECT * FROM teachers WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            conn.close()
            return redirect(url_for("login")) 

        # Insert the new user into the database
        cursor.execute("INSERT INTO teachers (email, password) VALUES (%s, %s)", (email, password))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for("login"))  # Redirect to login page after successful registration

    return render_template("register1.html")

# Sub Page (Year, Semester, and Subject Selection)
@app.route("/sub")
def sub_page():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("sub1.html")

# Handle Subject Submission
@app.route("/submit_subjects", methods=["POST"])
def submit_subjects():
    if "user" not in session:
        return redirect(url_for("login"))

    # Handle subject data if needed
    return redirect(url_for("upload_page"))

# Upload Page
@app.route("/upload")
def upload_page():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("upload1.html")

# Handle File Upload
@app.route("/upload_file", methods=["POST"])
def upload_file():
    if "user" not in session:
        return redirect(url_for("login"))

    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']

    if file.filename == '':
        return "No selected file", 400

    if file:
        # Save the file temporarily
        file_path = os.path.join("uploads", file.filename)
        file.save(file_path)

        # Redirect to marks page after successful upload
        return redirect(url_for("marks_page"))

# Marks Page
@app.route("/marks")
def marks_page():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("marks1.html")

# Preview Page
@app.route("/preview1")
def preview_page():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("preview1.html")

# Logout
@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)