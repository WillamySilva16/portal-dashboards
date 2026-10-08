"""
Robô do Dashboard de Vagas.

Roda a consulta Vagas.sql no SQL Server da empresa e grava o resultado
na tabela "VagaPosicao" do Postgres do portal (Railway). A tabela é
apagada e regravada inteira dentro de uma transação: se algo der errado
no meio, o portal continua com os dados anteriores.

Precisa de um .env na mesma pasta (veja .env.exemplo).
"""
import os
import sys
import time
from pathlib import Path

import pandas as pd
import psycopg2
import pyodbc
from dotenv import load_dotenv
from psycopg2.extras import execute_values

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

# Coluna do SQL -> coluna da tabela VagaPosicao
COLUNAS = {
    "Solicitação": "solicitacao",
    "Vaga": "vaga",
    "Posição": "posicao",
    "Status": "status",
    "Data": "data",
    "Fechamento": "fechamento",
    "SLA": "sla",
    "Solicitante": "solicitante",
    "Cargo": "cargo",
    "Categoria": "categoria",
    "Cliente": "cliente",
    "Local": "local",
    "Segmento": "segmento",
    "Supervisão": "supervisao",
    "Base": "base",
    "QtdSolicitada": "qtdSolicitada",
    "QtdAprovada": "qtdAprovada",
    "Fase": "fase",
    "SituaçãoFase": "situacaoFase",
}


def conectar_sqlserver():
    driver = os.environ.get("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    partes = [
        f"DRIVER={{{driver}}}",
        f"SERVER={os.environ['DB_SERVER']}",
        f"DATABASE={os.environ['DB_NAME']}",
        "TrustServerCertificate=yes",
    ]
    user = os.environ.get("DB_USER")
    if user:
        partes += [f"UID={user}", f"PWD={os.environ.get('DB_PASSWORD', '')}"]
    else:
        partes.append("Trusted_Connection=yes")  # autenticação do Windows
    return pyodbc.connect(";".join(partes), timeout=30)


def ler_vagas() -> pd.DataFrame:
    sql = (BASE_DIR / "Vagas.sql").read_text(encoding="utf-8-sig")
    with conectar_sqlserver() as conn:
        df = pd.read_sql_query(sql, conn)

    faltando = [c for c in COLUNAS if c not in df.columns]
    if faltando:
        raise RuntimeError(f"A consulta não trouxe as colunas: {faltando}")

    df = df[list(COLUNAS)].rename(columns=COLUNAS)
    df["data"] = pd.to_datetime(df["data"]).dt.date
    df["fechamento"] = pd.to_datetime(df["fechamento"])
    for c in ("solicitacao", "vaga", "posicao", "qtdSolicitada", "qtdAprovada"):
        df[c] = df[c].astype("Int64")
    # NaN/NaT viram NULL no Postgres
    return df.astype(object).where(pd.notna(df), None)


def gravar_postgres(df: pd.DataFrame):
    cols = list(COLUNAS.values())
    linhas = [tuple(r) for r in df[cols].itertuples(index=False)]
    sql_cols = ", ".join(f'"{c}"' for c in cols)

    # Tenta algumas vezes: a rede da empresa às vezes derruba a conexão com o Railway
    for tentativa in range(1, 4):
        try:
            with psycopg2.connect(os.environ["PORTAL_DATABASE_URL"], connect_timeout=20) as conn:
                with conn.cursor() as cur:
                    cur.execute('DELETE FROM "VagaPosicao"')
                    execute_values(
                        cur,
                        f'INSERT INTO "VagaPosicao" ({sql_cols}) VALUES %s',
                        linhas,
                        page_size=1000,
                    )
            conn.close()
            return
        except psycopg2.OperationalError as e:
            print(f"Falha ao conectar no Postgres (tentativa {tentativa}/3): {e}")
            if tentativa == 3:
                raise
            time.sleep(10 * tentativa)


def main():
    print("Lendo vagas do SQL Server...")
    df = ler_vagas()
    print(f"{len(df):,} posições lidas.")

    print("Gravando no Postgres do portal...")
    gravar_postgres(df)
    print("Pronto! Portal atualizado.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERRO: {e}")
        sys.exit(1)
