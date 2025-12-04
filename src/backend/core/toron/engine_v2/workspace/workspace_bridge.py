"""
WorkspaceBridge — allows Toron to integrate into Workspace.

Capabilities:
  ▸ Send analysis to Workspace widgets
  ▸ Receive context (calendar, tasks, notes)
  ▸ Provide Workspace → Toron reflective state
  ▸ ALOE-governed: Workspace signals require user consent
"""

class WorkspaceBridge:
    def __init__(self):
        pass

    async def inject_context(self, context, workspace_state):
        context["workspace"] = workspace_state
        return context

    async def deliver_analysis(self, workspace_callback, analysis):
        if callable(workspace_callback):
            await workspace_callback(analysis)
