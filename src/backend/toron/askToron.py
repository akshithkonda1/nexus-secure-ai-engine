from .fusionEngine import toron_fusion_process


async def ask_toron(req, memory):
    """Handle Toron requests using the fusion engine."""
    reply = await toron_fusion_process(req.message, memory)
    return reply
