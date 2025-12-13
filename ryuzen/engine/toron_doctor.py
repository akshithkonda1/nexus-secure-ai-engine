from ryuzen.engine.simulation_mode import SimulationMode
from ryuzen.engine.toron_engine import ToronEngine


class ToronDoctor:
    @staticmethod
    def run():
        print("[Toron Doctor] Diagnostics Running…")
        SimulationMode.enable()

        engine = ToronEngine()
        result = engine.generate_sync("diagnostic check")

        print("\nModels Loaded:", len(engine.providers))
        print("Consensus:", result["consensus"])
        print("Agreement Count:", result["agreement_count"])
        print("Compliance:", result["compliance"])
        print("Lineage:", result["lineage"])
        print("Response:", result["response"])

        print("\n[OK] Toron Engine appears operational.\n")
