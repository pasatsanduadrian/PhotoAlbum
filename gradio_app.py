import subprocess
import atexit
import os
import gradio as gr

# Start backend server
backend = subprocess.Popen(["npm", "run", "dev"], cwd="server")
# Start frontend
frontend = subprocess.Popen(["npm", "run", "dev", "--", "--host", "0.0.0.0"], cwd="client")

# Create a tunnel or proxy to access the frontend
try:
    from gradio.networking import setup_tunnel
    import secrets

    frontend_url = setup_tunnel(
        local_host="localhost",
        local_port=3000,
        share_token=secrets.token_urlsafe(16),
        share_server_address=None,
        share_server_tls_certificate=None,
    )
except Exception:
    frontend_url = f"/proxy/3000"

def cleanup():
    backend.terminate()
    frontend.terminate()

atexit.register(cleanup)

with gr.Blocks() as demo:
    gr.Markdown("# Roma Photo Map")
    gr.HTML(f"<iframe src='{frontend_url}' style='width:100%;height:600px;'></iframe>")

share_env = os.getenv("GRADIO_SHARE", "false").lower() == "true"
demo.launch(share=share_env)
