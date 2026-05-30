import 'package:flutter/material.dart';

abstract final class AppColors {
  static const background = Color(0xFF201A0C);
  static const surface = Color(0xFF272112);
  static const surfaceSoft = Color(0xFF332C19);
  static const textPrimary = Color(0xFFF9F8F5);
  static const textSecondary = Color(0xFFB8B2A3);
  static const accent = Color(0xFFF5C518);
  static const accentDark = Color(0xFFC49D10);
  static const dotInactive = Color(0xFF6A624B);
}

abstract final class AppRadii {
  static const double xl = 30;
  static const double lg = 22;
  static const double md = 16;
}

abstract final class AppShadows {
  static const List<BoxShadow> button = [
    BoxShadow(
      color: Color(0x66000000),
      blurRadius: 16,
      offset: Offset(0, 10),
    ),
    BoxShadow(
      color: Color(0x33FFE998),
      blurRadius: 10,
      offset: Offset(0, -2),
    ),
  ];

  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x70000000),
      blurRadius: 30,
      offset: Offset(0, 18),
    ),
    BoxShadow(
      color: Color(0x22FFE998),
      blurRadius: 16,
      offset: Offset(0, -3),
    ),
  ];
}

ThemeData buildAppTheme() {
  const colorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.accent,
    onPrimary: Color(0xFF241D08),
    secondary: AppColors.accentDark,
    onSecondary: AppColors.textPrimary,
    error: Color(0xFFE57373),
    onError: AppColors.textPrimary,
    surface: AppColors.surface,
    onSurface: AppColors.textPrimary,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: AppColors.background,
    textTheme: const TextTheme(
      headlineMedium: TextStyle(
        fontSize: 50,
        fontWeight: FontWeight.w800,
        color: AppColors.textPrimary,
        height: 1.08,
      ),
      titleLarge: TextStyle(
        fontSize: 52,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        height: 1.06,
      ),
      bodyLarge: TextStyle(
        fontSize: 26,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
        height: 1.45,
      ),
      labelLarge: TextStyle(
        fontSize: 34,
        fontWeight: FontWeight.w700,
      ),
    ),
  );
}
