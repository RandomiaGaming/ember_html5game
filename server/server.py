# User Settings
host = "127.0.0.1"
port = 80
custom_root = None
open_in_browser = True

# Import builtins (part of python)
import webbrowser
import os

# Import externals (must be installed with pip)
try:
    from flask import *
except:
    print("Error missing dependency. Flask is required. Would you like to install flask now? (y/n)")
    choice = input()
    if choice == "y" or choice == "yes":
        print()
        print("> pip install flask")
        os.system("pip install flask")
        print()
        from flask import *
    else:
        print("Execution cannot continue without required dependency flask. Aborting.")
        exit()

url = f"http://{host}:{port}/"
if custom_root != None:
    root = custom_root
else:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app = Flask("YTMOffline")

@app.route("/")
def serve_slash():
    file_path = os.path.join(root, "client", "index.html")
    return serve_file(file_path)

@app.route("/<path:file_name>")
def serve_slash_filename(file_name):
    file_path = os.path.join(root, "client", file_name)
    return serve_file(file_path)

def serve_file(file_path):
    response = send_from_directory(os.path.dirname(file_path), os.path.basename(file_path))
    response.headers.pop("Content-Disposition", None)
    response.headers.pop("Date", None)
    response.headers["Accept-Ranges"] = "bytes"
    return response

try:
    print(f"Hosting {root} at {url}...")
    if open_in_browser:
        if not webbrowser.open(url):
            if (os.system(f"start {url}") != 0):
                if (os.system(f"xdg-open {url}") != 0):
                    print(f"Failed to launch {url} please open manually.")
    app.run(host=host, port=port)
except KeyboardInterrupt:
    exit()
except:
    raise