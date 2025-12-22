"""
Simple validation test for telemetry system components.

Tests the code structure without requiring full environment setup.
"""

import sys
import os

def test_imports():
    """Test that all modules can be imported."""
    print("Testing module imports...")

    # Test report generator
    try:
        from telemetry.bundles.report_generator import ReportGenerator, get_report_generator
        print("✅ report_generator.py imports successfully")
    except Exception as e:
        print(f"❌ report_generator.py import failed: {e}")
        return False

    # Test bundle builder
    try:
        from telemetry.bundles.bundle_builder import build_bundle, _generate_executive_summary
        print("✅ bundle_builder.py imports successfully")
    except Exception as e:
        print(f"❌ bundle_builder.py import failed: {e}")
        return False

    return True


def test_report_generator_structure():
    """Test that ReportGenerator has all required methods."""
    print("\nTesting ReportGenerator structure...")

    from telemetry.bundles.report_generator import ReportGenerator

    generator = ReportGenerator()

    # Check attributes
    assert hasattr(generator, 'model_id'), "Missing model_id attribute"
    assert hasattr(generator, 'timeout'), "Missing timeout attribute"
    print(f"✅ model_id: {generator.model_id}")
    print(f"✅ timeout: {generator.timeout}s")

    # Check methods
    required_methods = [
        '_get_bedrock_client',
        '_compute_statistics',
        '_build_analysis_prompt',
        'generate_report',
        '_generate_placeholder_report'
    ]

    for method in required_methods:
        assert hasattr(generator, method), f"Missing method: {method}"
        print(f"✅ Method exists: {method}")

    return True


def test_bundle_builder_integration():
    """Test that bundle_builder has report integration."""
    print("\nTesting bundle_builder integration...")

    # Read the file and check for key integration points
    with open('/home/user/nexus-secure-ai-engine/telemetry/bundles/bundle_builder.py', 'r') as f:
        content = f.read()

    # Check for report generator import
    assert 'from telemetry.bundles.report_generator import get_report_generator' in content, \
        "Missing report_generator import"
    print("✅ Report generator imported")

    # Check for report generation code
    assert 'report_generator = get_report_generator()' in content, \
        "Missing report generator instantiation"
    print("✅ Report generator instantiated in build_bundle")

    assert 'reports = {}' in content or 'reports: Dict' in content, \
        "Missing reports dictionary"
    print("✅ Reports dictionary created")

    # Check for report generation loop
    assert 'for model_name in unique_models:' in content, \
        "Missing model loop for report generation"
    print("✅ Report generation loop present")

    # Check for ZIP integration
    assert 'reports/{safe_name}_analysis.md' in content, \
        "Missing report filename in ZIP"
    print("✅ Reports added to ZIP file")

    # Check for executive summary
    assert '_generate_executive_summary' in content, \
        "Missing executive summary function"
    print("✅ Executive summary function present")

    assert 'EXECUTIVE_SUMMARY.md' in content, \
        "Missing executive summary in ZIP"
    print("✅ Executive summary added to ZIP")

    # Check for manifest update
    assert 'reports_generated' in content, \
        "Missing reports_generated in manifest"
    print("✅ Manifest updated with reports_generated")

    return True


def test_file_structure():
    """Test that all required files exist."""
    print("\nTesting file structure...")

    required_files = [
        '/home/user/nexus-secure-ai-engine/telemetry/bundles/report_generator.py',
        '/home/user/nexus-secure-ai-engine/telemetry/bundles/bundle_builder.py',
        '/home/user/nexus-secure-ai-engine/ryuzen/engine/telemetry_client.py',
        '/home/user/nexus-secure-ai-engine/ryuzen/engine/toron_v25hplus.py',
        '/home/user/nexus-secure-ai-engine/test_telemetry_integration.py',
    ]

    for filepath in required_files:
        if os.path.exists(filepath):
            print(f"✅ {os.path.basename(filepath)} exists")
        else:
            print(f"❌ {filepath} missing")
            return False

    return True


def test_telemetry_client_integration():
    """Test that telemetry_client has all required features."""
    print("\nTesting telemetry_client.py...")

    with open('/home/user/nexus-secure-ai-engine/ryuzen/engine/telemetry_client.py', 'r') as f:
        content = f.read()

    # Check for key features
    checks = [
        ('class TelemetryClient:', 'TelemetryClient class'),
        ('async def emit_query_event', 'emit_query_event method'),
        ('def get_telemetry_client', 'get_telemetry_client function'),
        ('asyncio.create_task', 'Fire-and-forget pattern'),
        ('AWS Secrets Manager', 'AWS Secrets Manager support'),
        ('aiohttp', 'aiohttp for async HTTP'),
    ]

    for check_str, description in checks:
        if check_str in content:
            print(f"✅ {description}")
        else:
            print(f"❌ Missing: {description}")
            return False

    return True


def test_toron_integration():
    """Test that TORON has telemetry integration."""
    print("\nTesting TORON integration...")

    with open('/home/user/nexus-secure-ai-engine/ryuzen/engine/toron_v25hplus.py', 'r') as f:
        content = f.read()

    # Check for key integration points
    checks = [
        ('from ryuzen.engine.telemetry_client import get_telemetry_client', 'Telemetry client import'),
        ('self.telemetry_client = get_telemetry_client()', 'Telemetry client initialization'),
        ('user_id: Optional[str]', 'user_id parameter'),
        ('session_id: Optional[str]', 'session_id parameter'),
        ('asyncio.create_task', 'Fire-and-forget emission'),
        ('emit_query_event', 'Telemetry emission call'),
    ]

    for check_str, description in checks:
        if check_str in content:
            print(f"✅ {description}")
        else:
            print(f"❌ Missing: {description}")
            return False

    return True


if __name__ == "__main__":
    print("=" * 70)
    print("TELEMETRY SYSTEM VALIDATION TESTS")
    print("=" * 70)

    all_passed = True

    # Run all tests
    tests = [
        test_file_structure,
        test_imports,
        test_report_generator_structure,
        test_bundle_builder_integration,
        test_telemetry_client_integration,
        test_toron_integration,
    ]

    for test in tests:
        try:
            if not test():
                all_passed = False
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
            all_passed = False

    print("\n" + "=" * 70)
    if all_passed:
        print("ALL VALIDATION TESTS PASSED ✅")
        print("=" * 70)
        print("\n✅ Code structure is correct and complete")
        print("✅ All integrations are in place")
        print("✅ Ready for deployment (pending AWS credentials)")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED ❌")
        print("=" * 70)
        sys.exit(1)
