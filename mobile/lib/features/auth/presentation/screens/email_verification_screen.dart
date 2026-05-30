import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';

class EmailVerificationScreen extends StatelessWidget {
  const EmailVerificationScreen({super.key});

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
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Help', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 160,
                  height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary.withOpacity(0.05),
                  ),
                ),
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primary.withOpacity(0.2), Colors.transparent],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  ),
                  child: const Icon(Icons.mark_email_read, color: AppColors.primary, size: 64),
                ),
              ],
            ),
            const SizedBox(height: 40),
            const Text(
              'Verify your Email',
              style: TextStyle(color: AppColors.primary, fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              "We've sent a secure verification link to your university email address.",
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted, fontSize: 16),
            ),
            const SizedBox(height: 48),
            SkeuoButton(
              text: 'Check Inbox',
              onPressed: () {},
            ),
            const SizedBox(height: 16),
            SkeuoButton(
              text: 'Resend Email',
              isOutlined: true,
              onPressed: () {},
            ),
            const SizedBox(height: 40),
            RichText(
              textAlign: TextAlign.center,
              text: const TextSpan(
                style: TextStyle(color: AppColors.textMuted, fontSize: 14),
                children: [
                  TextSpan(text: "Didn't receive the email? Check your spam folder or "),
                  TextSpan(
                    text: 'contact support',
                    style: TextStyle(color: AppColors.primary, decoration: TextDecoration.underline),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
