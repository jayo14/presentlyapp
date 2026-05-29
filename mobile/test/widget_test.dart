import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

class MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (cert, host, port) => true;
  }
}

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  testWidgets('Splash screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    // We use runAsync to allow the timer to start without blocking
    await tester.runAsync(() async {
      await tester.pumpWidget(const PresentlyApp());

      // Verify that Splash screen text is shown.
      expect(find.text('Presently'), findsOneWidget);
      expect(find.text('VERIFIED ATTENDANCE.\nREAL PRESENCE.'), findsOneWidget);
    });
  });
}
