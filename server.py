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
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from supabase import create_client
from urllib.parse import urlparse, parse_qs, unquote

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

EMAIL_REMETENTE = os.getenv("EMAIL_REMETENTE")
EMAIL_DESTINO = os.getenv("EMAIL_DESTINO")
EMAIL_SENHA = os.getenv("EMAIL_SENHA")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Conexão com Supabase configurada com sucesso!")

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

    def do_GET(self):
        url = urlparse(self.path)

        if url.path == "/api/posts":
            parametros = parse_qs(url.query)
            
            try:
                pagina = max(1, int(parametros.get("pagina", ["1"])[0]))
            except ValueError:
                pagina = 1

            por_pagina = 6
            inicio = (pagina - 1) * por_pagina

            try:
                consulta = (
                    supabase.table("posts")
                    .select("*", count="exact")
                    .eq("publicado", True)
                )

                categoria = parametros.get("categoria", [""])[0]
                busca = parametros.get("busca", [""])[0]

                if categoria:
                    consulta = consulta.eq("categoria", categoria)

                if busca:
                    consulta = consulta.ilike("titulo", f"%{busca}%")

                resultado = (
                    consulta
                    .order("criado_em", desc=True)
                    .range(inicio, inicio + por_pagina - 1)
                    .execute()
                )

                total = resultado.count or 0

                self.send_json(200, {
                    "posts": resultado.data,
                    "pagina": pagina,
                    "total": total,
                    "total_paginas": (total + por_pagina - 1) // por_pagina
                })

            except Exception as erro:
                print("Erro ao buscar postagens:", erro)
                self.send_json(500, {"erro": "Não foi possível carregar as postagens."})

            return

        if url.path.startswith("/api/posts/"):
            slug = unquote(url.path.split("/api/posts/", 1)[1])

            try:
                resultado = (
                    supabase.table("posts")
                    .select("*")
                    .eq("slug", slug)
                    .eq("publicado", True)
                    .limit(1)
                    .execute()
                )

                if not resultado.data:
                    self.send_json(404, {"erro": "Postagem não encontrada."})
                    return

                self.send_json(200, resultado.data[0])

            except Exception as erro:
                print("Erro ao buscar postagem:", erro)
                self.send_json(500, {"erro": "Não foi possível carregar a postagem."})

            return

        super().do_GET()
    # Define uma função reutilizável do servidor.
    def do_POST(self):
        if self.path == "/api/contatos":
            self.do_POST_contatos()
            return

        if self.path != "/api/denuncias":
            self.send_json(404, {"erro": "Endpoint não encontrado."})
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

    def do_POST_contatos(self):
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
        email = self.clean_field(payload.get("email"), 254)
        assunto = self.clean_field(payload.get("assunto"), 160)
        mensagem = self.clean_field(payload.get("mensagem"), 3000)

        if not email or "@" not in email or not assunto or not mensagem:
            self.send_json(400, {"erro": "Preencha corretamente o e-mail, assunto e mensagem."})
            return

        registro = {
            "email": email,
            "emissao": mensagem,
            "data_emissao": datetime.now().date().isoformat(),
            "status": "pendente"
        }
        try:
            print("Dados enviados ao Supabase:", registro)

            supabase.table("formulario_suporte").insert(
                registro, returning="minimal"
            ).execute()

            print("Mensagem registrada no Supabase.")

        except Exception as erro:
            print("Erro ao salvar contato no Supabase:", erro)
            self.send_json(500, {"erro": "Não foi possível registrar sua mensagem. Tente novamente."})
            return

        notificacao_enviada = False

        try:
            if not all([EMAIL_REMETENTE, EMAIL_DESTINO, EMAIL_SENHA]):
                raise ValueError("Configurações de e-mail incompletas.")

            email_msg = EmailMessage()
            email_msg["Subject"] = f"Novo contato EcoPonto: {assunto}"
            email_msg["From"] = EMAIL_REMETENTE
            email_msg["To"] = EMAIL_DESTINO
            email_msg["Reply-To"] = email
            email_msg.set_content(
                f"Nova mensagem recebida pelo site EcoPonto.\n\n"
                f"Nome: {nome or 'Não informado'}\n"
                f"Email: {email}\n"
                f"Assunto: {assunto}\n\n"
                f"Mensagem:\n{mensagem}\n"
            )

            with smtplib.SMTP("smtp.gmail.com", 587) as servidor:
                servidor.starttls()
                servidor.login(EMAIL_REMETENTE, EMAIL_SENHA)
                servidor.send_message(email_msg)

            notificacao_enviada = True

        except Exception as erro:
            print("Erro ao enviar notificação por e-mail:", erro)

        if notificacao_enviada:
            self.send_json(201, {"mensagem": "Mensagem registrada e notificação enviada."})
        else:
            self.send_json(201, {"mensagem": "Mensagem registrada, mas a notificação por e-mail não foi enviada."})

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
