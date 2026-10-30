package br.bias.replay.mixin;
import br.bias.replay.NativeReplay;

import net.minecraft.*;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value=class_742.class, remap=false)
public class NativeSkinMixin {
    @Inject(method="method_52814", at=@At("HEAD"), cancellable=true, remap=false)
    private void skinOfRecordedPlayer(CallbackInfoReturnable<class_8685> cir) {
        class_742 target = NativeReplay.target();
        if (target != null && (Object)this == class_310.method_1551().field_1724) cir.setReturnValue(target.method_52814());
    }
}
