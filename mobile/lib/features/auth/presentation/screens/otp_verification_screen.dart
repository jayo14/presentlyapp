import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';

class OtpVerificationScreen extends StatelessWidget {
  const OtpVerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Verification', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 32),
            Text(
              'Enter the 6-digit code',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'We sent a code to your registered device.',
              style: TextStyle(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(
                6,
                (index) => Container(
                  width: 50,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceHighest.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: index == 2 ? AppColors.primary : AppColors.outline.withOpacity(0.3),
                      width: index == 2 ? 2 : 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      index < 2 ? (index == 0 ? '5' : '2') : '',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Resend code in ', style: TextStyle(color: AppColors.textMuted)),
                const Text('00:59', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ],
            ),
            const Spacer(),
            SkeuoButton(
              text: 'Verify',
              onPressed: () => context.go('/'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
