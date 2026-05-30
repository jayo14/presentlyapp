import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';

class ResetSuccessScreen extends StatelessWidget {
  const ResetSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 500,
              height: 500,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppColors.primary.withOpacity(0.08), Colors.transparent],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const SizedBox(height: 48),
                const Text(
                  'ACCOUNT RECOVERY',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const Spacer(),
                Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary.withOpacity(0.05),
                        ),
                      ),
                      Container(
                        width: 112,
                        height: 112,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary.withOpacity(0.1),
                          border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 60,
                              spreadRadius: -10,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.check, color: AppColors.primary, size: 64),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                Text(
                  'Password Reset\nSuccessful!',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 16),
                const Text(
                  'You can now use your new password to log in to the university attendance portal.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textMuted, fontSize: 16),
                ),
                const Spacer(),
                SkeuoButton(
                  text: 'Back to Login',
                  onPressed: () => context.go('/login'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
