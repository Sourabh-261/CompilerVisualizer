from flask import Flask, render_template, request, jsonify
from core.compiler import compile_code

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/compile", methods=["POST"])
def compile():

    code = request.json["code"]

    result = compile_code(code)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)