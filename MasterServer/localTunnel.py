from flask import Flask, request, redirect
import requests
import base64
app = Flask(__name__)

@app.route("/")
def handle_request():
    localtunnel_url = request.args.get("lt_url")
    try:
        # Decode the URL using base64.b64decode()
        localtunnel_url = base64.b64decode(localtunnel_url).decode()
    except Exception as e:
        # Handle decoding error (e.g., invalid format)
        # Raise an error or return an appropriate message
        return f"Error: Invalid URL format: {e}"

    # Bypass header value
    bypass_header_value = "true"

    # Construct the headers dict
    headers = {"bypass-tunnel-reminder": bypass_header_value}

    # Send the request with custom headers using requests
    try:
        response = requests.get(localtunnel_url, headers=headers)
        if response.status_code == 200:
            return response.text  # Handle successful response
        else:
            return f"Error: {response.status_code}"  # Handle error
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"  # Handle network or other errors

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)  # Adapt host and port as needed

