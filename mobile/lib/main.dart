import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/navigation/app_router.dart';

void main() {
  runApp(const PresentlyApp());
}

class PresentlyApp extends StatelessWidget {
  const PresentlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Presently',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: appRouter,
    );
  }
}
