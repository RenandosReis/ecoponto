# Importa um recurso necessário ao servidor.
import json
# Importa um recurso necessário ao servidor.
import threading
# Importa um recurso necessário ao servidor.
from datetime import datetime, timezone
# Importa um recurso necessário ao servidor.
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
# Importa um recurso necessário ao servidor.
from pathlib import Path
# Importa um recurso necessário ao servidor.
from uuid import uuid4


# Executa uma instrução de processamento do servidor.
ROOT = Path(__file__).resolve().parent
# Executa uma instrução de processamento do servidor.
DATA_FILE = ROOT / "data" / "denuncias.json"
# Executa uma instrução de processamento do servidor.
MAX_REQUEST_SIZE = 16_384
# Executa uma instrução de processamento do servidor.
data_lock = threading.Lock()


# Define uma classe responsável por uma parte do servidor.
class EcoMovimentoHandler(SimpleHTTPRequestHandler):
    # Define uma função reutilizável do servidor.
    def do_POST(self):
        # Executa estas instruções apenas quando a condição é verdadeira.
        if self.path != "/api/denuncias":
            # Executa uma instrução de processamento do servidor.
            self.send_json(404, {"erro": "Endpoint não encontrado."})
            # Executa uma instrução de processamento do servidor.
            return

        # Tenta executar operações que podem gerar erros.
        try:
            # Executa uma instrução de processamento do servidor.
            content_length = int(self.headers.get("Content-Length", "0"))
        # Trata um possível erro ocorrido na tentativa anterior.
        except ValueError:
            # Executa uma instrução de processamento do servidor.
            self.send_json(400, {"erro": "Tamanho da solicitação inválido."})
            # Executa uma instrução de processamento do servidor.
            return

        # Executa estas instruções apenas quando a condição é verdadeira.
        if content_length <= 0 or content_length > MAX_REQUEST_SIZE:
            # Executa uma instrução de processamento do servidor.
            self.send_json(413, {"erro": "A solicitação está vazia ou é muito grande."})
            # Executa uma instrução de processamento do servidor.
            return

        # Tenta executar operações que podem gerar erros.
        try:
            # Executa uma instrução de processamento do servidor.
            payload = json.loads(self.rfile.read(content_length))
        # Trata um possível erro ocorrido na tentativa anterior.
        except (json.JSONDecodeError, UnicodeDecodeError):
            # Executa uma instrução de processamento do servidor.
            self.send_json(400, {"erro": "Envie os dados em formato JSON válido."})
            # Executa uma instrução de processamento do servidor.
            return

        # Executa estas instruções apenas quando a condição é verdadeira.
        if not isinstance(payload, dict):
            # Executa uma instrução de processamento do servidor.
            self.send_json(400, {"erro": "Os dados enviados são inválidos."})
            # Executa uma instrução de processamento do servidor.
            return

        # Executa uma instrução de processamento do servidor.
        nome = self.clean_field(payload.get("nome"), 120)
        # Executa uma instrução de processamento do servidor.
        bairro = self.clean_field(payload.get("bairro"), 160)
        # Executa uma instrução de processamento do servidor.
        descricao = self.clean_field(payload.get("descricao"), 2000)

        # Executa estas instruções apenas quando a condição é verdadeira.
        if not bairro or not descricao:
            # Executa uma instrução de processamento do servidor.
            self.send_json(400, {"erro": "Informe o bairro e a descrição da ocorrência."})
            # Executa uma instrução de processamento do servidor.
            return

        # Executa uma instrução de processamento do servidor.
        denuncia = {
            # Executa uma instrução de processamento do servidor.
            "id": str(uuid4()),
            # Executa uma instrução de processamento do servidor.
            "nome": nome,
            # Executa uma instrução de processamento do servidor.
            "bairro": bairro,
            # Executa uma instrução de processamento do servidor.
            "descricao": descricao,
            # Executa uma instrução de processamento do servidor.
            "criada_em": datetime.now(timezone.utc).isoformat(),
        # Executa uma instrução de processamento do servidor.
        }

        # Tenta executar operações que podem gerar erros.
        try:
            # Executa uma instrução de processamento do servidor.
            self.save_report(denuncia)
        # Trata um possível erro ocorrido na tentativa anterior.
        except OSError:
            # Executa uma instrução de processamento do servidor.
            self.send_json(500, {"erro": "Não foi possível salvar a denúncia."})
            # Executa uma instrução de processamento do servidor.
            return

        # Executa uma instrução de processamento do servidor.
        self.send_json(201, {"mensagem": "Denúncia registrada localmente.", "id": denuncia["id"]})

    # Aplica configuração ou comportamento ao elemento seguinte.
    @staticmethod
    # Define uma função reutilizável do servidor.
    def clean_field(value, max_length):
        # Executa estas instruções apenas quando a condição é verdadeira.
        if not isinstance(value, str):
            # Retorna o resultado processado pela função.
            return ""
        # Retorna o resultado processado pela função.
        return value.strip()[:max_length]

    # Aplica configuração ou comportamento ao elemento seguinte.
    @staticmethod
    # Define uma função reutilizável do servidor.
    def save_report(denuncia):
        # Abre um recurso e o encerra automaticamente ao terminar.
        with data_lock:
            # Executa uma instrução de processamento do servidor.
            DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
            # Executa estas instruções apenas quando a condição é verdadeira.
            if DATA_FILE.exists():
                # Abre um recurso e o encerra automaticamente ao terminar.
                with DATA_FILE.open("r", encoding="utf-8") as file:
                    # Executa uma instrução de processamento do servidor.
                    denuncias = json.load(file)
                # Executa estas instruções apenas quando a condição é verdadeira.
                if not isinstance(denuncias, list):
                    # Informa que ocorreu uma exceção no processamento.
                    raise OSError("Arquivo de denúncias inválido.")
            # Inicia um bloco organizado pelo nível de indentação.
            else:
                # Executa uma instrução de processamento do servidor.
                denuncias = []

            # Executa uma instrução de processamento do servidor.
            denuncias.append(denuncia)
            # Executa uma instrução de processamento do servidor.
            temporary_file = DATA_FILE.with_suffix(".tmp")
            # Abre um recurso e o encerra automaticamente ao terminar.
            with temporary_file.open("w", encoding="utf-8") as file:
                # Executa uma instrução de processamento do servidor.
                json.dump(denuncias, file, ensure_ascii=False, indent=2)
            # Executa uma instrução de processamento do servidor.
            temporary_file.replace(DATA_FILE)

    # Define uma função reutilizável do servidor.
    def send_json(self, status, payload):
        # Executa uma instrução de processamento do servidor.
        response = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        # Executa uma instrução de processamento do servidor.
        self.send_response(status)
        # Executa uma instrução de processamento do servidor.
        self.send_header("Content-Type", "application/json; charset=utf-8")
        # Executa uma instrução de processamento do servidor.
        self.send_header("Content-Length", str(len(response)))
        # Executa uma instrução de processamento do servidor.
        self.end_headers()
        # Executa uma instrução de processamento do servidor.
        self.wfile.write(response)


# Executa estas instruções apenas quando a condição é verdadeira.
if __name__ == "__main__":
    # Executa uma instrução de processamento do servidor.
    handler = lambda *args, **kwargs: EcoMovimentoHandler(
        # Executa uma instrução de processamento do servidor.
        *args, directory=str(ROOT), **kwargs
    # Executa uma instrução de processamento do servidor.
    )
    # Executa uma instrução de processamento do servidor.
    server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    # Executa uma instrução de processamento do servidor.
    print("EcoMovimento disponível em http://127.0.0.1:8000")
    # Tenta executar operações que podem gerar erros.
    try:
        # Executa uma instrução de processamento do servidor.
        server.serve_forever()
    # Trata um possível erro ocorrido na tentativa anterior.
    except KeyboardInterrupt:
        # Executa uma instrução de processamento do servidor.
        print("\nServidor encerrado.")
    # Inicia um bloco organizado pelo nível de indentação.
    finally:
        # Executa uma instrução de processamento do servidor.
        server.server_close()
