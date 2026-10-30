package br.bias.replay.mixin;
import br.bias.replay.NativeReplay;

import net.minecraft.*;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value=class_1297.class, remap=false)
public class NativeVisibilityMixin {
    @Inject(method="method_5767", at=@At("HEAD"), cancellable=true, remap=false)
    private void visibleNativeArm(CallbackInfoReturnable<Boolean> cir) {
        if (NativeReplay.drawingHands && (Object)this == class_310.method_1551().field_1724) cir.setReturnValue(false);
    }
}
