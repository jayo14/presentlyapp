import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class SkeuoCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final Color? color;
  final BorderRadius? borderRadius;

  const SkeuoCard({
    super.key,
    required this.child,
    this.padding,
    this.width,
    this.height,
    this.color,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      padding: padding ?? const EdgeInsets.all(24),
      decoration: AppTheme.getSkeuoCardDecoration(
        color: color,
        borderRadius: borderRadius,
      ),
      child: child,
    );
  }
}
