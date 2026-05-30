import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    final textTheme = GoogleFonts.lexendTextTheme(
      const TextTheme(
        displayLarge: TextStyle(
          fontSize: 40,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.015,
          color: AppColors.textLight,
        ),
        headlineLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.015,
          color: AppColors.textLight,
        ),
        headlineMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColors.textLight,
        ),
        titleLarge: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textLight,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: AppColors.textLight,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.textMuted,
        ),
        labelLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.015,
          color: AppColors.backgroundDark,
        ),
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: AppColors.backgroundDark,
        surface: AppColors.surfaceDark,
        onSurface: AppColors.textLight,
        outline: AppColors.outline,
      ),
      textTheme: textTheme,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceHighest,
        contentPadding: const EdgeInsets.all(16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        hintStyle: const TextStyle(color: AppColors.textMuted),
      ),
    );
  }

  static TextStyle get manropeDisplay => GoogleFonts.manrope(
        fontWeight: FontWeight.w800,
        color: AppColors.textLight,
      );

  static BoxDecoration skeuoContainer({
    Color? color,
    BorderRadius? borderRadius,
    bool hasShadow = true,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.surfaceHighest,
      borderRadius: borderRadius ?? BorderRadius.circular(16),
      border: Border.all(color: AppColors.outline.withOpacity(0.5)),
      boxShadow: hasShadow
          ? [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                offset: const Offset(0, 4),
                blurRadius: 10,
              ),
              BoxShadow(
                color: Colors.white.withOpacity(0.05),
                offset: const Offset(-2, -2),
                blurRadius: 4,
              ),
            ]
          : null,
    );
  }

  static BoxDecoration getSkeuoButtonDecoration({Color? color}) {
    return BoxDecoration(
      color: color ?? AppColors.primary,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: (color ?? AppColors.primary).withOpacity(0.3),
          offset: const Offset(0, 8),
          blurRadius: 20,
        ),
        BoxShadow(
          color: Colors.white.withOpacity(0.2),
          offset: const Offset(0, -2),
          blurRadius: 4,
          spreadRadius: 0,
        ),
      ],
    );
  }

  static BoxDecoration getSkeuoCardDecoration({Color? color, BorderRadius? borderRadius}) {
    return BoxDecoration(
      color: color ?? AppColors.surfaceDark,
      borderRadius: borderRadius ?? BorderRadius.circular(24),
      border: Border.all(color: AppColors.outline.withOpacity(0.3)),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.4),
          offset: const Offset(0, 12),
          blurRadius: 24,
        ),
      ],
    );
  }
}
