import json
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "denuncias.json"
MAX_REQUEST_SIZE = 16_384
data_lock = threading.Lock()


class EcoMovimentoHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/denuncias":
            self.send_json(404, {"erro": "Endpoint não encontrado."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"erro": "Tamanho da solicitação inválido."})
            return

        if content_length <= 0 or content_length > MAX_REQUEST_SIZE:
            self.send_json(413, {"erro": "A solicitação está vazia ou é muito grande."})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json(400, {"erro": "Envie os dados em formato JSON válido."})
            return

        if not isinstance(payload, dict):
            self.send_json(400, {"erro": "Os dados enviados são inválidos."})
            return

        nome = self.clean_field(payload.get("nome"), 120)
        bairro = self.clean_field(payload.get("bairro"), 160)
        descricao = self.clean_field(payload.get("descricao"), 2000)

        if not bairro or not descricao:
            self.send_json(400, {"erro": "Informe o bairro e a descrição da ocorrência."})
            return

        denuncia = {
            "id": str(uuid4()),
            "nome": nome,
            "bairro": bairro,
            "descricao": descricao,
            "criada_em": datetime.now(timezone.utc).isoformat(),
        }

        try:
            self.save_report(denuncia)
        except OSError:
            self.send_json(500, {"erro": "Não foi possível salvar a denúncia."})
            return

        self.send_json(201, {"mensagem": "Denúncia registrada localmente.", "id": denuncia["id"]})

    @staticmethod
    def clean_field(value, max_length):
        if not isinstance(value, str):
            return ""
        return value.strip()[:max_length]

    @staticmethod
    def save_report(denuncia):
        with data_lock:
            DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
            if DATA_FILE.exists():
                with DATA_FILE.open("r", encoding="utf-8") as file:
                    denuncias = json.load(file)
                if not isinstance(denuncias, list):
                    raise OSError("Arquivo de denúncias inválido.")
            else:
                denuncias = []

            denuncias.append(denuncia)
            temporary_file = DATA_FILE.with_suffix(".tmp")
            with temporary_file.open("w", encoding="utf-8") as file:
                json.dump(denuncias, file, ensure_ascii=False, indent=2)
            temporary_file.replace(DATA_FILE)

    def send_json(self, status, payload):
        response = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)


if __name__ == "__main__":
    handler = lambda *args, **kwargs: EcoMovimentoHandler(
        *args, directory=str(ROOT), **kwargs
    )
    server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    print("EcoMovimento disponível em http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()